import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/src/theme';

export default function TabLayout() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      initialRouteName="challenges"
      screenOptions={{
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 56,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 18 },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="companion"
        options={{ title: 'Companion', tabBarLabel: 'Companion' }}
      />
      <Tabs.Screen
        name="challenges"
        options={{ title: 'Your goals', tabBarLabel: 'Challenges' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Your growth', tabBarLabel: 'Profile' }}
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
