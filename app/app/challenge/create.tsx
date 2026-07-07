import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  formatDisplayDate,
  parseDisplayDate,
} from '@/src/lib/challenge-display';
import {
  validateChallengeForm,
  type ChallengeFieldErrors,
} from '@/src/lib/challenge-validation';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

export default function CreateChallengeScreen() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [wager, setWager] = useState('');
  const [lives, setLives] = useState('0');
  const [companionPhone, setCompanionPhone] = useState('');
  const [companionIds, setCompanionIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ChallengeFieldErrors>({});
  const [loading, setLoading] = useState(false);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (!editId) return;
    supabase.from('challenges').select('*').eq('id', editId).single().then(({ data }) => {
      if (!data) return;
      setName(data.name);
      setStartDate(formatDisplayDate(data.start_date));
      setEndDate(formatDisplayDate(data.end_date));
      setWager(data.wager);
      setLives(String(data.lives_total));
    });
  }, [editId]);

  const searchCompanion = async () => {
    const digits = companionPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('Invalid phone', 'Enter at least 10 digits to search.');
      return;
    }
    const { data, error } = await supabase.rpc('search_profiles_by_phone', {
      p_digits: digits,
    });
    if (error || !data?.length) {
      Alert.alert('Not found', 'No user with that phone. Use SMS invite for non-users.');
      return;
    }
    setCompanionIds((prev) => [...new Set([...prev, data[0].id])]);
    setCompanionPhone('');
    setFieldErrors((e) => ({ ...e, companions: undefined }));
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

    const validation = validateChallengeForm({
      name,
      start_date: startIso,
      end_date: endIso,
      wager,
      lives_total: parseInt(lives, 10) || 0,
      companionCount: companionIds.length,
    });
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
        lives_total: parseInt(lives, 10) || 0,
        companion_user_ids: companionIds,
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
    if (!editId && !name) {
      Alert.alert('Save draft first', 'Create the challenge before sending SMS invites.');
      return;
    }
    try {
      const challengeId = editId;
      if (!challengeId) {
        Alert.alert('Create first', 'Create the challenge draft, then invite via SMS from edit.');
        return;
      }
      await invokeChallengeAction('invite_companion_sms', {
        challenge_id: challengeId,
        phone: companionPhone,
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{editId ? 'Edit Draft' : 'New Challenge'}</Text>
      <Field
        label="Name"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
      />
      <Field
        label="Start date (DD-MM-YYYY)"
        value={startDate}
        onChangeText={setStartDate}
        error={fieldErrors.start_date}
      />
      <Field
        label="End date (DD-MM-YYYY)"
        value={endDate}
        onChangeText={setEndDate}
        error={fieldErrors.end_date}
      />
      <Field label="Wager" value={wager} onChangeText={setWager} error={fieldErrors.wager} />
      <Field
        label="Lives"
        value={lives}
        onChangeText={setLives}
        keyboardType="number-pad"
        error={fieldErrors.lives}
      />
      <Text style={styles.hint}>Timezone: {timezone}</Text>

      <Text style={styles.section}>Companions</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }, fieldErrors.companions ? styles.inputError : null]}
          placeholder="Phone number (dev: 9000000002)"
          value={companionPhone}
          onChangeText={setCompanionPhone}
          keyboardType="phone-pad"
        />
        <Pressable style={styles.smallBtn} onPress={searchCompanion}>
          <Text style={styles.smallBtnText}>Add</Text>
        </Pressable>
      </View>
      {fieldErrors.companions ? (
        <Text style={styles.errorText}>{fieldErrors.companions}</Text>
      ) : null}
      {companionIds.map((cid) => (
        <Text key={cid} style={styles.companionId}>
          Companion: {cid.slice(0, 8)}…
        </Text>
      ))}
      {editId && (
        <Pressable style={styles.secondary} onPress={inviteSms}>
          <Text style={styles.secondaryText}>SMS invite (non-user)</Text>
        </Pressable>
      )}

      <Pressable style={styles.primary} onPress={submit} disabled={loading}>
        <Text style={styles.primaryText}>
          {loading ? 'Saving…' : editId ? 'Save draft' : 'Create challenge'}
        </Text>
      </Pressable>
      {editId && (
        <Pressable style={styles.danger} onPress={deleteDraft}>
          <Text style={styles.primaryText}>Delete draft</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'number-pad';
  error?: string;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  inputError: { borderColor: '#b91c1c' },
  errorText: { color: '#b91c1c', fontSize: 12, marginBottom: 8 },
  hint: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  smallBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  smallBtnText: { color: '#fff', fontWeight: '600' },
  companionId: { fontSize: 12, color: '#374151', marginBottom: 4 },
  primary: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryText: { color: '#2563eb', fontWeight: '600' },
  danger: {
    backgroundColor: '#b91c1c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: { color: '#fff', fontWeight: '600' },
});
