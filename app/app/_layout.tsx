import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/src/context/AuthContext';
import { ThemeProvider } from '@/src/theme';
import { heroArcFonts } from '@/src/theme/fonts';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(heroArcFonts);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#FAF6EE' },
            headerTintColor: '#3D6B54',
            headerTitleStyle: { fontFamily: 'Manrope_700Bold' },
            contentStyle: { backgroundColor: '#FAF6EE' },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ title: 'Join HeroArc' }} />
          <Stack.Screen name="signup-verify" options={{ title: 'Verify your number' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/create" options={{ title: 'New goal' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
