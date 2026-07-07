import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import {
  getLoginEmailByPhone,
  normalizePhoneDigits,
  validateLoginForm,
} from '@/src/lib/auth-forms';
import { devAccounts, devSignIn, devSkipAuth } from '@/src/lib/dev-auth';
import { supabase } from '@/src/lib/supabase';

export default function LoginScreen() {
  const { session } = useAuth();
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) return <Redirect href="/challenges" />;

  const devLogin = async (role: 'challenger' | 'companion') => {
    setLoading(true);
    const err = await devSignIn(role);
    setLoading(false);
    if (err) {
      Alert.alert('Dev login failed', err);
    }
  };

  const login = async () => {
    const e164 = normalizePhoneDigits(phoneCountryCode, phone);
    const validationError = validateLoginForm(e164, password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const email = await getLoginEmailByPhone(e164);
      if (!email) {
        setError('No account found for this mobile number. Sign up first.');
        return;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (devSkipAuth) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dev login</Text>
        <Text style={styles.sub}>Use welcome screen shortcuts or log in below</Text>
        <TouchableOpacityRow
          label={`Sign in as ${devAccounts.challenger.label}`}
          sub={devAccounts.challenger.email}
          onPress={() => devLogin('challenger')}
          loading={loading}
        />
        <TouchableOpacityRow
          label={`Sign in as ${devAccounts.companion.label}`}
          sub={devAccounts.companion.email}
          onPress={() => devLogin('companion')}
          loading={loading}
          secondary
        />
        <Link href="/welcome" asChild>
          <Pressable style={styles.linkBtn}>
            <Text style={styles.linkText}>← Welcome</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Log In</Text>
      <Text style={styles.sub}>Mobile number and password (V1)</Text>
      <Link href="/welcome" asChild>
        <Text style={styles.back}>← Back</Text>
      </Link>

      <Text style={styles.label}>Country code</Text>
      <TextInput
        style={styles.input}
        value={phoneCountryCode}
        onChangeText={setPhoneCountryCode}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Mobile number</Text>
      <TextInput
        style={styles.input}
        placeholder="10-digit number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.btn} onPress={login} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Log in'}</Text>
      </Pressable>

      <Link href="/signup" asChild>
        <Pressable>
          <Text style={styles.linkText}>Create an account</Text>
        </Pressable>
      </Link>
    </KeyboardAvoidingView>
  );
}

function TouchableOpacityRow({
  label,
  sub,
  onPress,
  loading,
  secondary,
}: {
  label: string;
  sub: string;
  onPress: () => void;
  loading: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      style={[styles.btn, secondary && styles.btnSecondary]}
      onPress={onPress}
      disabled={loading}>
      <Text style={styles.btnText}>{label}</Text>
      <Text style={styles.btnSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  sub: { textAlign: 'center', color: '#6b7280', marginVertical: 12 },
  back: { color: '#2563eb', marginBottom: 16 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  error: { color: '#b91c1c', marginBottom: 12 },
  btn: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnSecondary: { backgroundColor: '#15803d' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  btnSub: { color: '#dbeafe', fontSize: 12, marginTop: 4 },
  linkBtn: { marginTop: 8, alignItems: 'center' },
  linkText: { color: '#2563eb', textAlign: 'center', marginTop: 8 },
});
