import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
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
import { colors, spacing } from '@/src/theme';
import { AppText, Button } from '@/src/ui';

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
        <AppText variant="displayMedium" style={styles.title}>
          Dev login
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.sub}>
          Use welcome screen shortcuts or log in below
        </AppText>
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
            <AppText variant="bodyMedium" color={colors.primary}>
              ← Welcome
            </AppText>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppText variant="displayMedium" style={styles.title}>
        Welcome back
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.sub}>
        Log in with your mobile number
      </AppText>
      <Link href="/welcome" asChild>
        <AppText variant="bodyMedium" color={colors.primary} style={styles.back}>
          ← Back
        </AppText>
      </Link>

      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        Country code
      </AppText>
      <TextInput
        style={styles.input}
        value={phoneCountryCode}
        onChangeText={setPhoneCountryCode}
        keyboardType="phone-pad"
        placeholderTextColor={colors.textMuted}
      />
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        Mobile number
      </AppText>
      <TextInput
        style={styles.input}
        placeholder="10-digit number"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        Password
      </AppText>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={colors.textMuted}
      />
      {error ? (
        <AppText variant="caption" color={colors.gentleAlert} style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <Button
        title={loading ? 'Signing in…' : 'Log in'}
        onPress={login}
        disabled={loading}
        fullWidth
        style={styles.btn}
      />

      <Link href="/signup" asChild>
        <Pressable>
          <AppText variant="bodyMedium" color={colors.primary} style={styles.linkText}>
            Create an account
          </AppText>
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
    <Button
      title={label}
      onPress={onPress}
      disabled={loading}
      variant={secondary ? 'secondary' : 'primary'}
      fullWidth
      style={styles.devRow}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing[6], backgroundColor: colors.background },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center', marginVertical: spacing[3] },
  back: { marginBottom: spacing[4] },
  label: { marginBottom: spacing[1] },
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
  error: { marginBottom: spacing[3] },
  btn: { marginBottom: spacing[3] },
  devRow: { marginBottom: spacing[3] },
  linkBtn: { marginTop: spacing[2], alignItems: 'center' },
  linkText: { textAlign: 'center', marginTop: spacing[2] },
});
