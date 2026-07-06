import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

/** Root URL — send users to login or the main Challenges tab. */
export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Redirect href="/challenges" />;
  return <Redirect href="/login" />;
}
