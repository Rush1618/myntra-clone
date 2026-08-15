import { Stack } from 'expo-router';
import React from 'react';
import { useAppTheme } from '@/theme/ThemeProvider';


export default function AuthLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
