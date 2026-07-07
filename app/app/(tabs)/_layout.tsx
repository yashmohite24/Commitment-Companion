import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

export default function TabLayout() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      initialRouteName="challenges"
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="companion"
        options={{ title: 'Companion', tabBarLabel: 'Companion' }}
      />
      <Tabs.Screen
        name="challenges"
        options={{ title: 'Challenges', tabBarLabel: 'Challenges' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'My Profile', tabBarLabel: 'Profile' }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
