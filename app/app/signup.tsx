import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import {
  COUNTRY_OPTIONS,
  checkPhoneRegistered,
  normalizePhoneDigits,
  validateSignupForm,
  type SignupFieldErrors,
} from '@/src/lib/auth-forms';
import { supabase } from '@/src/lib/supabase';

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('IN');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<SignupFieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onCountryChange = (code: string) => {
    setCountry(code);
    const match = COUNTRY_OPTIONS.find((c) => c.code === code);
    if (match) setPhoneCountryCode(match.dial);
  };

  const submit = async () => {
    const validation = validateSignupForm({
      first_name: firstName,
      last_name: lastName,
      country,
      phone_country_code: phoneCountryCode,
      phone,
      email,
      password,
      confirm_password: confirmPassword,
    });
    setErrors(validation.errors);
    if (!validation.ok) return;

    const e164 = normalizePhoneDigits(phoneCountryCode, phone);
    setLoading(true);
    try {
      const registered = await checkPhoneRegistered(e164);
      if (registered) {
        Alert.alert(
          'Account exists',
          'A user with this mobile number already exists. Please log in instead.',
          [{ text: 'Log in', onPress: () => router.replace('/login') }, { text: 'OK' }],
        );
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            country,
            phone_country_code: phoneCountryCode,
            phone: e164,
            email: email.trim(),
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed');

      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (otpError) {
        Alert.alert(
          'Account created',
          'Your account was created. Phone OTP could not be sent — enable Phone auth in Supabase or log in with email and password.',
          [{ text: 'Log in', onPress: () => router.replace('/login') }],
        );
        return;
      }

      router.push({
        pathname: '/signup-verify',
        params: { phone: e164, email: email.trim() },
      });
    } catch (e) {
      Alert.alert('Sign up failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sign Up</Text>
      <Link href="/welcome" asChild>
        <Text style={styles.back}>← Back</Text>
      </Link>

      <Field label="First name" value={firstName} onChangeText={setFirstName} error={errors.first_name} />
      <Field label="Last name" value={lastName} onChangeText={setLastName} error={errors.last_name} />

      <Text style={styles.label}>Country</Text>
      <View style={styles.row}>
        {COUNTRY_OPTIONS.map((c) => (
          <Pressable
            key={c.code}
            style={[styles.chip, country === c.code && styles.chipActive]}
            onPress={() => onCountryChange(c.code)}>
            <Text style={country === c.code ? styles.chipTextActive : styles.chipText}>
              {c.code}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.country ? <Text style={styles.error}>{errors.country}</Text> : null}

      <Field
        label="Country code"
        value={phoneCountryCode}
        onChangeText={setPhoneCountryCode}
        error={errors.phone_country_code}
      />
      <Field
        label="Phone (10 digits)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={errors.phone}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <Field
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={errors.confirm_password}
      />

      <Pressable style={styles.primary} onPress={submit} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? 'Creating…' : 'Sign up'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  back: { color: '#2563eb', marginBottom: 16 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  inputError: { borderColor: '#b91c1c' },
  error: { color: '#b91c1c', fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  primary: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryText: { color: '#fff', fontWeight: '600' },
});
