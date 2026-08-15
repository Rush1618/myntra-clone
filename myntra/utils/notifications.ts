import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import axios from "axios";

const API_BASE_URL = "http://192.168.0.114:5000";

/**
 * Configure how notifications appear when the app is in the foreground.
 * Must be called before any notification logic runs.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permission and register the device's Expo push token with the backend.
 * Safe to call on every login — backend handles upsert gracefully.
 *
 * @param {string} userId - The authenticated user's MongoDB _id
 * @returns {Promise<string | null>} - The push token, or null if permission denied / simulator
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  // Expo push tokens only work on physical devices
  const isPhysicalDevice =
    Platform.OS !== "web" &&
    typeof (global as any).__DEV__ !== "undefined";

  if (!isPhysicalDevice && Platform.OS !== "android" && Platform.OS !== "ios") {
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existingStatus === "granted"
      ? existingStatus
      : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Myntra Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E11D48",
    });
  }

  // Get the Expo push token
  let token: string;
  try {
    const tokenObj = await Notifications.getExpoPushTokenAsync();
    token = tokenObj.data;
  } catch (err) {
    console.log("Failed to get push token:", err);
    return null;
  }

  // Register with backend
  try {
    await axios.post(`${API_BASE_URL}/notifications/register`, {
      userId,
      token,
      platform: Platform.OS,
    });
  } catch {
    // Non-fatal — will retry on next launch
    console.log("Token registration to backend failed, will retry on next launch");
  }

  return token;
}

/**
 * Set up notification listeners for foreground and tap events.
 * Returns a cleanup function to call on component unmount.
 */
export function setupNotificationListeners(
  onNotificationTap?: (notification: Notifications.NotificationResponse) => void
): () => void {
  const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
    // Notification received while app is in foreground — handler above shows it
    console.log("Foreground notification:", notification.request.content.title);
  });

  const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
    // User tapped the notification
    onNotificationTap?.(response);
  });

  return () => {
    foregroundSub.remove();
    tapSub.remove();
  };
}
