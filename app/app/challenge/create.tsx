import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  formatDisplayDate,
  formatProfileName,
  parseDisplayDate,
} from '@/src/lib/challenge-display';
import {
  challengeDurationDays,
  maxLivesAllowed,
  validateChallengeForm,
  type ChallengeFieldErrors,
} from '@/src/lib/challenge-validation';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { CompanionPicker, type SelectedCompanion } from '@/src/components/CompanionPicker';
import { supabase } from '@/src/lib/supabase';
import { colors, spacing } from '@/src/theme';
import { AppText, Button, Screen, TextInput } from '@/src/ui';

const STEPS = ['Basics', 'Companions', 'Stakes'] as const;

export default function CreateChallengeScreen() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [wager, setWager] = useState('');
  const [lives, setLives] = useState('0');
  const [companions, setCompanions] = useState<SelectedCompanion[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ChallengeFieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const durationDays = useMemo(() => {
    const startIso = parseDisplayDate(startDate);
    const endIso = parseDisplayDate(endDate);
    if (!startIso || !endIso) return 0;
    return challengeDurationDays(startIso, endIso);
  }, [startDate, endDate]);

  const maxLives = maxLivesAllowed(durationDays);
  const livesNum = parseInt(lives, 10) || 0;

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data } = await supabase.from('challenges').select('*').eq('id', editId).single();
      if (!data) return;
      setName(data.name);
      setStartDate(formatDisplayDate(data.start_date));
      setEndDate(formatDisplayDate(data.end_date));
      setWager(data.wager);
      setLives(String(data.lives_total));

      const { data: requests } = await supabase
        .from('companion_requests')
        .select('companion_user_id, profiles(id, display_name, first_name, last_name, phone)')
        .eq('challenge_id', editId)
        .in('status', ['pending', 'accepted']);

      setCompanions(
        (requests ?? []).map((r) => {
          const profile = r.profiles as {
            id: string;
            display_name: string | null;
            first_name: string | null;
            last_name: string | null;
            phone: string | null;
          } | null;
          return {
            id: r.companion_user_id,
            name: formatProfileName(profile),
            phone: profile?.phone,
          };
        }),
      );
    })();
  }, [editId]);

  const validateStep = (current: number): boolean => {
    const startIso = parseDisplayDate(startDate);
    const endIso = parseDisplayDate(endDate);
    const errors: ChallengeFieldErrors = {};

    if (current === 0) {
      if (!startIso) errors.start_date = 'Enter start date as DD-MM-YYYY';
      if (!endIso) errors.end_date = 'Enter end date as DD-MM-YYYY';
      if (startIso && endIso) {
        const full = validateChallengeForm(
          {
            name,
            start_date: startIso,
            end_date: endIso,
            wager: wager || 'placeholder',
            lives_total: 0,
            companionCount: 1,
          },
          timezone,
        );
        if (full.errors.name) errors.name = full.errors.name;
        if (full.errors.start_date) errors.start_date = full.errors.start_date;
        if (full.errors.end_date) errors.end_date = full.errors.end_date;
      } else if (name.trim().length === 0) {
        errors.name = 'Challenge name must be 1–200 characters';
      }
    }

    if (current === 1) {
      if (companions.length === 0) {
        errors.companions = 'Add at least one companion';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async () => {
    const startIso = parseDisplayDate(startDate);
    const endIso = parseDisplayDate(endDate);
    const parseErrors: ChallengeFieldErrors = {};
    if (!startIso) parseErrors.start_date = 'Enter start date as DD-MM-YYYY';
    if (!endIso) parseErrors.end_date = 'Enter end date as DD-MM-YYYY';
    if (Object.keys(parseErrors).length > 0) {
      setFieldErrors(parseErrors);
      return;
    }

    const validation = validateChallengeForm(
      {
        name,
        start_date: startIso,
        end_date: endIso,
        wager,
        lives_total: livesNum,
        companionCount: companions.length,
      },
      timezone,
    );
    setFieldErrors(validation.errors);
    if (!validation.ok) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        start_date: startIso,
        end_date: endIso,
        daily_deadline_time: '23:59:00',
        timezone,
        wager: wager.trim(),
        lives_total: livesNum,
        companion_user_ids: companions.map((c) => c.id),
      };
      if (editId) {
        await invokeChallengeAction('update_challenge', {
          challenge_id: editId,
          ...payload,
        });
      } else {
        const result = await invokeChallengeAction<{ challenge: { id: string } }>(
          'create_challenge',
          payload,
        );
        router.replace(`/challenge/create?id=${result.challenge.id}`);
        return;
      }
      router.replace('/(tabs)/challenges');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const inviteSms = async () => {
    if (!editId) {
      Alert.alert('Save draft first', 'Create the goal before sending SMS invites.');
      return;
    }
    try {
      await invokeChallengeAction('invite_companion_sms', {
        challenge_id: editId,
        phone: invitePhone,
      });
      Alert.alert('Sent', 'SMS invite sent.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  const deleteDraft = async () => {
    if (!editId) return;
    Alert.alert('Delete draft?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await invokeChallengeAction('delete_challenge', { challenge_id: editId });
          router.back();
        },
      },
    ]);
  };

  const next = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const adjustLives = (delta: number) => {
    const nextVal = Math.min(maxLives, Math.max(0, livesNum + delta));
    setLives(String(nextVal));
    setFieldErrors((e) => ({ ...e, lives: undefined }));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="displayMedium" style={styles.title}>
          {editId ? 'Edit draft' : 'New goal'}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.sub}>
          {STEPS[step]} · Step {step + 1} of {STEPS.length}
        </AppText>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>

        {step === 0 && (
          <>
            <TextInput
              label="Goal name"
              value={name}
              onChangeText={setName}
              error={fieldErrors.name}
              placeholder="Morning run, read 20 pages…"
            />
            <TextInput
              label="Start date (DD-MM-YYYY)"
              value={startDate}
              onChangeText={setStartDate}
              error={fieldErrors.start_date}
            />
            <TextInput
              label="End date (DD-MM-YYYY)"
              value={endDate}
              onChangeText={setEndDate}
              error={fieldErrors.end_date}
            />
            <AppText variant="caption" color={colors.textMuted}>
              Timezone: {timezone} · Daily deadline 11:59 PM
            </AppText>
          </>
        )}

        {step === 1 && (
          <>
            <AppText variant="body" color={colors.textSecondary} style={styles.helper}>
              Pick people who want to see you win.
            </AppText>
            <CompanionPicker
              selected={companions}
              onChange={(next) => {
                setCompanions(next);
                if (next.length > 0) {
                  setFieldErrors((e) => ({ ...e, companions: undefined }));
                }
              }}
              error={fieldErrors.companions}
            />
            {editId && (
              <>
                <TextInput
                  label="SMS invite (non-user)"
                  value={invitePhone}
                  onChangeText={setInvitePhone}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                />
                <Button title="Send SMS invite" variant="secondary" onPress={inviteSms} fullWidth />
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              label="Stakes"
              value={wager}
              onChangeText={setWager}
              error={fieldErrors.wager}
              placeholder="Buy the group coffee if I miss"
              multiline
            />
            <AppText variant="label" color={colors.textMuted} style={styles.livesLabel}>
              Saves (busy days — not excuses)
            </AppText>
            <View style={styles.stepper}>
              <Pressable style={styles.stepBtn} onPress={() => adjustLives(-1)}>
                <AppText variant="title">−</AppText>
              </Pressable>
              <AppText variant="title" style={styles.livesValue}>
                {livesNum}
              </AppText>
              <Pressable style={styles.stepBtn} onPress={() => adjustLives(1)}>
                <AppText variant="title">+</AppText>
              </Pressable>
              <AppText variant="caption" color={colors.textMuted} style={styles.maxLives}>
                Max {maxLives} for {durationDays || '…'} days
              </AppText>
            </View>
            {fieldErrors.lives ? (
              <AppText variant="caption" color={colors.gentleAlert}>
                {fieldErrors.lives}
              </AppText>
            ) : null}
          </>
        )}

        <View style={styles.nav}>
          <Button title={step === 0 ? 'Cancel' : 'Back'} variant="ghost" onPress={back} />
          <Button
            title={
              loading
                ? 'Saving…'
                : step < STEPS.length - 1
                  ? 'Continue'
                  : editId
                    ? 'Save draft'
                    : 'Send invitations'
            }
            onPress={next}
            disabled={loading}
            style={styles.nextBtn}
          />
        </View>

        {editId && step === STEPS.length - 1 && (
          <Button title="Delete draft" variant="soft" onPress={deleteDraft} fullWidth />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing[8] },
  title: { marginBottom: spacing[1] },
  sub: { marginBottom: spacing[4] },
  dots: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary },
  helper: { marginBottom: spacing[3] },
  livesLabel: { marginBottom: spacing[2] },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livesValue: { minWidth: 32, textAlign: 'center' },
  maxLives: { flex: 1 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[6],
    gap: spacing[3],
  },
  nextBtn: { flex: 1 },
});
