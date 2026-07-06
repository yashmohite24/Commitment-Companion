import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/src/context/AuthContext';
import { submitFeedback } from '@/src/lib/challenge-actions';
import { supabase } from '@/src/lib/supabase';
import type { ProfileStats } from '@/src/lib/types';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [feedbackHeader, setFeedbackHeader] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();
    setDisplayName(profile?.display_name ?? '');

    const { data: statsData } = await supabase.rpc('get_profile_stats');
    if (statsData) setStats(statsData as ProfileStats);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const saveName = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
    Alert.alert('Saved', 'Display name updated.');
  };

  const sendFeedback = async () => {
    try {
      await submitFeedback(feedbackHeader, feedbackMessage);
      setFeedbackHeader('');
      setFeedbackMessage('');
      Alert.alert('Thanks', 'Feedback submitted.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.label}>Display name</Text>
      <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
      <Pressable style={styles.btn} onPress={saveName}>
        <Text style={styles.btnText}>Save name</Text>
      </Pressable>

      {stats && (
        <View style={styles.stats}>
          <Text style={styles.section}>Statistics</Text>
          <StatRow label="Consistent Since (days)" value={stats.consistent_since} />
          <StatRow label="Longest Streak" value={stats.longest_streak} />
          <StatRow label="Wager Settlement Ratio" value={`${stats.wager_settlement_ratio}%`} />
          <StatRow label="Challenges Created" value={stats.challenges_created} />
          <StatRow label="Challenges Completed" value={stats.challenges_completed} />
          <StatRow label="Wagers Realized" value={stats.wagers_realized} />
        </View>
      )}

      <Text style={styles.section}>Feedback</Text>
      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={feedbackHeader}
        onChangeText={setFeedbackHeader}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Message"
        multiline
        value={feedbackMessage}
        onChangeText={setFeedbackMessage}
      />
      <Pressable style={styles.btn} onPress={sendFeedback}>
        <Text style={styles.btnText}>Submit feedback</Text>
      </Pressable>

      <Pressable
        style={styles.link}
        onPress={() => WebBrowser.openBrowserAsync(process.env.EXPO_PUBLIC_PRIVACY_URL!)}>
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => WebBrowser.openBrowserAsync(process.env.EXPO_PUBLIC_DATA_URL!)}>
        <Text style={styles.linkText}>Data Policy</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.logout]} onPress={signOut}>
        <Text style={styles.btnText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '600' },
  stats: { marginVertical: 16 },
  section: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statLabel: { color: '#374151' },
  statValue: { fontWeight: '600' },
  link: { paddingVertical: 8 },
  linkText: { color: '#2563eb' },
  logout: { backgroundColor: '#b91c1c', marginTop: 16 },
});
