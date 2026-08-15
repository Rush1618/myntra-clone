import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AppThemeProvider, useAppTheme } from "@/theme/ThemeProvider";
import React from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { registerForPushNotifications, setupNotificationListeners } from "@/utils/notifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      {/* AuthProvider wraps RootLayoutContent so useAuth() works inside */}
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}

/**
 * Separated from RootLayout so it can safely call:
 *  - useAuth()   → inside AuthProvider
 *  - useAppTheme() → inside AppThemeProvider
 */
function RootLayoutContent() {
  const { navigationTheme, isDark, isReady } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Register push token whenever authenticated user becomes available
  useEffect(() => {
    if (user?._id) {
      void registerForPushNotifications(user._id);
    }
  }, [user?._id]);

  // Handle notification taps — navigate to the relevant screen
  useEffect(() => {
    const cleanup = setupNotificationListeners((response) => {
      const data = response.notification.request.content.data;
      if (data && typeof data.screen === "string") {
        // @ts-expect-error - Expo Router enforces strict types for paths, but screen is dynamic from the push notification
        router.push(`/${data.screen}`);
      }
    });
    return cleanup;
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
