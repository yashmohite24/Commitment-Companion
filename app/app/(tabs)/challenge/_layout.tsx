import { Stack } from 'expo-router';

export default function ChallengeTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
      }}
    />
  );
}
