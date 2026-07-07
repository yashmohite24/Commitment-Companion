import { Link, Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { devAccounts, devSignIn, devSkipAuth } from '@/src/lib/dev-auth';

export default function WelcomeScreen() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Redirect href="/challenges" />;

  const devLogin = async (role: 'challenger' | 'companion') => {
    await devSignIn(role);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commitment App</Text>
      <Text style={styles.sub}>Daily challenges with companion accountability</Text>

      <Link href="/signup" asChild>
        <Pressable style={styles.primary}>
          <Text style={styles.primaryText}>Sign Up</Text>
        </Pressable>
      </Link>

      <Link href="/login" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>Log In</Text>
        </Pressable>
      </Link>

      {devSkipAuth && (
        <View style={styles.devBlock}>
          <Text style={styles.devLabel}>Dev shortcuts</Text>
          <Pressable style={styles.devBtn} onPress={() => devLogin('challenger')}>
            <Text style={styles.devBtnText}>{devAccounts.challenger.label}</Text>
          </Pressable>
          <Pressable style={styles.devBtn} onPress={() => devLogin('companion')}>
            <Text style={styles.devBtnText}>{devAccounts.companion.label}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  sub: { textAlign: 'center', color: '#6b7280', marginVertical: 16, marginBottom: 32 },
  primary: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondary: {
    borderWidth: 1,
    borderColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryText: { color: '#2563eb', fontWeight: '600', fontSize: 16 },
  devBlock: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  devLabel: { textAlign: 'center', color: '#9ca3af', marginBottom: 12, fontSize: 12 },
  devBtn: {
    backgroundColor: '#15803d',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  devBtnText: { color: '#fff', fontWeight: '600' },
});
