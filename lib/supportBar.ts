import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';

const TASK = 'clearway-support-bar';
const NOTIF_ID = 'clearway-support-bar';
const CHANNEL_ID = 'support-bar';

export async function cleanupSupportBar() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.dismissNotificationAsync(NOTIF_ID);
    await Notifications.deleteNotificationChannelAsync(CHANNEL_ID);
    if (await TaskManager.isTaskRegisteredAsync(TASK)) {
      await BackgroundTask.unregisterTaskAsync(TASK);
    }
  } catch {
    return;
  }
}
