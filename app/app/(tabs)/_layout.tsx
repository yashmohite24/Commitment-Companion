import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { prefetchFocusData } from '@/src/hooks/useFocusData';
import { fetchChallengesTabData } from '@/src/lib/challenges-tab-data';
import { fetchCompanionTabData } from '@/src/lib/companion-tab-data';
import { colors } from '@/src/theme';
import { CompanionTabIcon, GoalsTabIcon, GrowthTabIcon } from '@/src/ui/icons/TabIcons';

export default function TabLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    prefetchFocusData(`challenges:${userId}`, () => fetchChallengesTabData(userId));
    prefetchFocusData(`companion:${userId}`, () => fetchCompanionTabData(userId));
  }, [session?.user?.id]);

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      initialRouteName="challenges"
      screenOptions={{
        lazy: false,
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
        options={{
          title: 'Companion',
          tabBarLabel: 'Companion',
          tabBarActiveTintColor: colors.companion,
          tabBarIcon: ({ color }) => <CompanionTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenge',
          tabBarLabel: 'Challenge',
          tabBarIcon: ({ color }) => <GoalsTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <GrowthTabIcon color={color} />,
        }}
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
