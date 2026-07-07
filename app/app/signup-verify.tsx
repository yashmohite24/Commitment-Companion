import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';

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
    <View style={styles.container}>
      <Text style={styles.title}>Verify phone</Text>
      <Text style={styles.sub}>
        Enter the OTP sent to {phone}
        {email ? `\nAccount: ${email}` : ''}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="OTP code"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      <Pressable style={styles.primary} onPress={verify} disabled={loading}>
        <Text style={styles.primaryText}>{loading ? 'Verifying…' : 'Verify'}</Text>
      </Pressable>
      <Pressable onPress={resend} disabled={resendIn > 0}>
        <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>
          {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/signup')}>
        <Text style={styles.link}>← Back to sign up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#6b7280', marginBottom: 16, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  primary: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryText: { color: '#fff', fontWeight: '600' },
  link: { color: '#2563eb', textAlign: 'center', marginTop: 12 },
  linkDisabled: { color: '#9ca3af' },
});
