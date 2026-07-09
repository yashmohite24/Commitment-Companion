import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { colors, spacing } from '@/src/theme';
import { AppText, Button, Screen, TextInput } from '@/src/ui';

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
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="displayMedium" style={styles.title}>
          Join HeroArc
        </AppText>
        <Link href="/welcome" asChild>
          <Pressable>
            <AppText color={colors.primary} style={styles.back}>
              ← Back
            </AppText>
          </Pressable>
        </Link>

        <TextInput label="First name" value={firstName} onChangeText={setFirstName} error={errors.first_name} />
        <TextInput label="Last name" value={lastName} onChangeText={setLastName} error={errors.last_name} />

        <AppText variant="label" color={colors.textMuted} style={styles.countryLabel}>
          Country
        </AppText>
        <View style={styles.row}>
          {COUNTRY_OPTIONS.map((c) => (
            <Pressable
              key={c.code}
              style={[styles.chip, country === c.code && styles.chipActive]}
              onPress={() => onCountryChange(c.code)}>
              <AppText
                variant="label"
                color={country === c.code ? colors.textInverse : colors.textSecondary}>
                {c.code}
              </AppText>
            </Pressable>
          ))}
        </View>
        {errors.country ? (
          <AppText variant="caption" color={colors.gentleAlert} style={styles.countryError}>
            {errors.country}
          </AppText>
        ) : null}

        <TextInput
          label="Country code"
          value={phoneCountryCode}
          onChangeText={setPhoneCountryCode}
          error={errors.phone_country_code}
        />
        <TextInput
          label="Phone (10 digits)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        <TextInput
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirm_password}
        />

        <Button
          title={loading ? 'Creating…' : 'Sign up'}
          onPress={submit}
          disabled={loading}
          fullWidth
          style={styles.submit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing[8] },
  title: { marginBottom: spacing[2] },
  back: { marginBottom: spacing[4] },
  countryLabel: { marginBottom: spacing[1] },
  countryError: { marginBottom: spacing[2] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
    backgroundColor: colors.surfaceTint,
  },
  chipActive: { backgroundColor: colors.primary },
  submit: { marginTop: spacing[4] },
});
