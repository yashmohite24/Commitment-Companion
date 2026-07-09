import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/src/context/AuthContext';
import { submitFeedback } from '@/src/lib/challenge-actions';
import { supabase } from '@/src/lib/supabase';
import type { ProfileStats } from '@/src/lib/types';
import { colors, radius, spacing } from '@/src/theme';
import { AppText, Button } from '@/src/ui';

interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
}

function formatName(p: ProfileRow | null): string {
  if (!p) return '—';
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
  return full || p.display_name || '—';
}

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [feedbackHeader, setFeedbackHeader] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, display_name, email, phone')
      .eq('id', user.id)
      .single();
    setProfile((data as ProfileRow) ?? null);

    const { data: statsData } = await supabase.rpc('get_profile_stats');
    if (statsData) setStats(statsData as ProfileStats);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const sendFeedback = async () => {
    try {
      await submitFeedback(feedbackHeader, feedbackMessage);
      setFeedbackHeader('');
      setFeedbackMessage('');
      Alert.alert('Thanks', 'We read every note.');
    } catch (e) {
      Alert.alert("Something didn't go as planned", e instanceof Error ? e.message : 'Please try again');
    }
  };

  const name = formatName(profile);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <AppText variant="title" color={colors.primary}>
            {initials(name)}
          </AppText>
        </View>
        <AppText variant="title">{name}</AppText>
        {profile?.email ? (
          <AppText variant="caption" color={colors.textMuted}>
            {profile.email}
          </AppText>
        ) : null}
      </View>

      {stats && (
        <View style={styles.statsSection}>
          <AppText variant="heading" style={styles.sectionTitle}>
            Your growth
          </AppText>
          <View style={styles.metricGrid}>
            <MetricCard label="Showing up since" value={`${stats.consistent_since} days`} />
            <MetricCard label="Longest run" value={`${stats.longest_streak} days`} />
            <MetricCard label="Settled with honesty" value={`${stats.wager_settlement_ratio}%`} />
            <MetricCard label="Goals started" value={stats.challenges_created} />
            <MetricCard label="Friends supported" value={stats.challenges_completed} />
            <MetricCard label="Wagers kept" value={stats.wagers_realized} />
          </View>
        </View>
      )}

      <AppText variant="heading" style={styles.sectionTitle}>
        Feedback
      </AppText>
      <TextInput
        style={styles.input}
        placeholder="Subject"
        placeholderTextColor={colors.textMuted}
        value={feedbackHeader}
        onChangeText={setFeedbackHeader}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Tell us what would make HeroArc better for you"
        placeholderTextColor={colors.textMuted}
        multiline
        value={feedbackMessage}
        onChangeText={setFeedbackMessage}
      />
      <Button title="Send feedback" onPress={sendFeedback} fullWidth style={styles.feedbackBtn} />

      <Pressable
        style={styles.link}
        onPress={() => WebBrowser.openBrowserAsync(process.env.EXPO_PUBLIC_PRIVACY_URL!)}>
        <AppText variant="bodyMedium" color={colors.primary}>
          Privacy Policy
        </AppText>
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => WebBrowser.openBrowserAsync(process.env.EXPO_PUBLIC_DATA_URL!)}>
        <AppText variant="bodyMedium" color={colors.primary}>
          Data Policy
        </AppText>
      </Pressable>

      <Button title="Log out" onPress={signOut} variant="soft" fullWidth style={styles.logout} />
    </ScrollView>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metricCard}>
      <AppText variant="title" color={colors.primary}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing[4], paddingBottom: spacing[10] },
  identity: { alignItems: 'center', marginBottom: spacing[6] },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  statsSection: { marginBottom: spacing[6] },
  sectionTitle: { marginBottom: spacing[3] },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metricCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing[3],
    marginBottom: spacing[3],
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  feedbackBtn: { marginBottom: spacing[4] },
  link: { paddingVertical: spacing[2] },
  logout: { marginTop: spacing[4] },
});
