import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { colors, spacing } from '@/src/theme';
import { AppText, Button, Screen, TextInput } from '@/src/ui';

const RESEND_SECONDS = 120;

export default function SignupVerifyScreen() {
  const { phone, email } = useLocalSearchParams<{ phone: string; email: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  if (session) return <Redirect href="/challenges" />;
  if (!phone) return <Redirect href="/signup" />;

  const verify = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Enter the code sent to your phone.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      if (error) {
        Alert.alert('OTP mismatch', error.message, [
          { text: 'Change details', onPress: () => router.replace('/signup') },
          { text: 'Retry' },
        ]);
        return;
      }
      router.replace('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0) return;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) Alert.alert('Could not resend', error.message);
    else {
      setResendIn(RESEND_SECONDS);
      Alert.alert('Sent', 'A new OTP was sent to your phone.');
    }
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.inner}>
        <AppText variant="displayMedium" style={styles.title}>
          Verify phone
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.sub}>
          Enter the OTP sent to {phone}
          {email ? `\nAccount: ${email}` : ''}
        </AppText>
        <TextInput
          placeholder="OTP code"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
        <Button
          title={loading ? 'Verifying…' : 'Verify'}
          onPress={verify}
          disabled={loading}
          fullWidth
        />
        <Pressable onPress={resend} disabled={resendIn > 0} style={styles.linkWrap}>
          <AppText color={resendIn > 0 ? colors.textMuted : colors.primary}>
            {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
          </AppText>
        </Pressable>
        <Pressable onPress={() => router.replace('/signup')}>
          <AppText color={colors.primary}>← Back to sign up</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  inner: { paddingVertical: spacing[6] },
  title: { marginBottom: spacing[2] },
  sub: { marginBottom: spacing[4], lineHeight: 22 },
  linkWrap: { marginVertical: spacing[4] },
});
