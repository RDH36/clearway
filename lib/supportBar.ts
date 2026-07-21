import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { buildWidgetData } from '@/components/widget/data';
import { refreshWidget } from '@/components/widget/refresh';
import { premiumFromPersisted } from '@/lib/premium';

const TASK = 'clearway-support-bar';
const NOTIF_ID = 'clearway-support-bar';
const CHANNEL_ID = 'support-bar';

async function ensureChannel() {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Lock-screen support',
    importance: Notifications.AndroidImportance.LOW,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function supportBarAllowed(): Promise<boolean> {
  const raw = await AsyncStorage.getItem('clearway-quit-store');
  const state = raw ? JSON.parse(raw)?.state : null;
  if (!state?.notifications?.supportBar) return false;
  return premiumFromPersisted(state);
}

export async function hideSupportBar() {
  try {
    await Notifications.dismissNotificationAsync(NOTIF_ID);
  } catch {
    return;
  }
}

export async function showSupportBar() {
  try {
    if (Platform.OS !== 'android') return;
    if (!(await supportBarAllowed())) {
      await hideSupportBar();
      return;
    }
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;
    const data = await buildWidgetData();
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_ID,
      content: {
        title: 'Clearway ✦',
        body: data.affirmation,
        sticky: true,
        autoDismiss: false,
        sound: false,
      },
      trigger: { channelId: CHANNEL_ID },
    });
  } catch {
    return;
  }
}

TaskManager.defineTask(TASK, async () => {
  await Promise.all([showSupportBar(), refreshWidget()]);
  return BackgroundTask.BackgroundTaskResult.Success;
});

export async function syncSupportBar(enabled: boolean) {
  if (Platform.OS !== 'android') return;
  try {
    if (enabled) {
      await showSupportBar();
      await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 60 });
    } else {
      await hideSupportBar();
      if (await TaskManager.isTaskRegisteredAsync(TASK)) {
        await BackgroundTask.unregisterTaskAsync(TASK);
      }
    }
  } catch {
    return;
  }
}
