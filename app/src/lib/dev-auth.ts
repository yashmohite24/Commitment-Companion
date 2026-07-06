import { supabase } from './supabase';

/** When true, login uses email/password dev accounts instead of phone OTP. */
export const devSkipAuth = process.env.EXPO_PUBLIC_DEV_SKIP_AUTH === 'true';

export const devAccounts = {
  challenger: {
    email: process.env.EXPO_PUBLIC_DEV_CHALLENGER_EMAIL ?? 'challenger@test.local',
    password: process.env.EXPO_PUBLIC_DEV_CHALLENGER_PASSWORD ?? 'password123',
    label: 'Challenger',
  },
  companion: {
    email: process.env.EXPO_PUBLIC_DEV_COMPANION_EMAIL ?? 'companion@test.local',
    password: process.env.EXPO_PUBLIC_DEV_COMPANION_PASSWORD ?? 'password123',
    label: 'Companion',
  },
};

export async function devSignIn(role: 'challenger' | 'companion'): Promise<string | null> {
  const account = devAccounts[role];
  const { error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  return error?.message ?? null;
}
