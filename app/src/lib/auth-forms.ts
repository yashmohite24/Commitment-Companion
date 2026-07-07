import { supabase } from './supabase';

export type SignupFieldErrors = Partial<
  Record<
    | 'first_name'
    | 'last_name'
    | 'country'
    | 'phone_country_code'
    | 'phone'
    | 'email'
    | 'password'
    | 'confirm_password',
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z]).{7,}$/;

export function normalizePhoneDigits(countryCode: string, localPhone: string): string {
  const cc = countryCode.replace(/\D/g, '');
  const local = localPhone.replace(/\D/g, '').slice(-10);
  return cc && local ? `+${cc}${local}` : '';
}

export function validateSignupForm(input: {
  first_name: string;
  last_name: string;
  country: string;
  phone_country_code: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
}): { ok: boolean; errors: SignupFieldErrors } {
  const errors: SignupFieldErrors = {};
  const first = input.first_name.trim();
  const last = input.last_name.trim();

  if (first.length === 0 || first.length > 20) {
    errors.first_name = 'First name must be 1–20 characters';
  }
  if (last.length === 0 || last.length > 20) {
    errors.last_name = 'Last name must be 1–20 characters';
  }
  if (!input.country.trim()) {
    errors.country = 'Select a country';
  }
  if (!input.phone_country_code.trim()) {
    errors.phone_country_code = 'Country code is required';
  }
  const digits = input.phone.replace(/\D/g, '');
  if (digits.length !== 10) {
    errors.phone = 'Phone number must be 10 digits';
  }
  const email = input.email.trim();
  if (!EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!PASSWORD_RE.test(input.password)) {
    errors.password = 'At least 7 characters with one uppercase letter';
  }
  if (input.password !== input.confirm_password) {
    errors.confirm_password = 'Passwords do not match';
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function validateLoginForm(phone: string, password: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return 'Enter a valid mobile number';
  if (!password) return 'Password is required';
  return null;
}

export async function checkPhoneRegistered(e164Phone: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_phone_registered', {
    p_phone: e164Phone,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function getLoginEmailByPhone(e164Phone: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_login_email_by_phone', {
    p_phone: e164Phone,
  });
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}

export const COUNTRY_OPTIONS = [
  { code: 'IN', label: 'India', dial: '+91' },
  { code: 'US', label: 'United States', dial: '+1' },
  { code: 'GB', label: 'United Kingdom', dial: '+44' },
  { code: 'AU', label: 'Australia', dial: '+61' },
  { code: 'CA', label: 'Canada', dial: '+1' },
] as const;
