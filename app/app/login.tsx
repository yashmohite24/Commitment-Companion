import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { devAccounts, devSignIn, devSkipAuth } from '@/src/lib/dev-auth';
import { supabase } from '@/src/lib/supabase';

export default function LoginScreen() {
  const { session } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session) return <Redirect href="/challenges" />;

  const devLogin = async (role: 'challenger' | 'companion') => {
    setLoading(true);
    const err = await devSignIn(role);
    setLoading(false);
    if (err) {
      Alert.alert(
        'Dev login failed',
        `${err}\n\nCreate this user in Supabase Dashboard → Authentication → Users → Add user (email + password).`,
      );
    }
  };

  const sendOtp = async () => {
    const normalized = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    if (normalized.length < 11) {
      Alert.alert('Invalid phone', 'Enter phone with country code, e.g. +919876543210');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else setSent(true);
  };

  const verifyOtp = async () => {
    const normalized = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: otp,
      type: 'sms',
    });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  if (devSkipAuth) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Commitment App</Text>
        <Text style={styles.sub}>Dev mode — OTP disabled</Text>
        <Text style={styles.hint}>
          Create these users in Supabase (Auth → Users) with email + password if they do not exist
          yet.
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => devLogin('challenger')}
          disabled={loading}>
          <Text style={styles.btnText}>Sign in as {devAccounts.challenger.label}</Text>
          <Text style={styles.btnSub}>{devAccounts.challenger.email}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => devLogin('companion')}
          disabled={loading}>
          <Text style={styles.btnText}>Sign in as {devAccounts.companion.label}</Text>
          <Text style={styles.btnSub}>{devAccounts.companion.email}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Commitment App</Text>
      <Text style={styles.sub}>Sign in with your phone number</Text>
      <TextInput
        style={styles.input}
        placeholder="+1234567890"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!sent}
      />
      {sent && (
        <TextInput
          style={styles.input}
          placeholder="OTP code"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      )}
      <TouchableOpacity
        style={styles.btn}
        onPress={sent ? verifyOtp : sendOtp}
        disabled={loading}>
        <Text style={styles.btnText}>{sent ? 'Verify' : 'Send OTP'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  sub: { textAlign: 'center', color: '#6b7280', marginVertical: 12 },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
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
});
