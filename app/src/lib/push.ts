import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const isExpoGo = Constants.appOwnership === 'expo';

async function getNotifications() {
  if (Platform.OS === 'web' || isExpoGo) return null;
  return import('expo-notifications');
}

export async function registerForPushNotifications(userId: string): Promise<void> {
  if (Platform.OS === 'web' || isExpoGo) return;

  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
  } catch {
    // Push is optional in dev (Expo Go, missing projectId, etc.)
  }
}
