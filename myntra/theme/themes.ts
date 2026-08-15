import { DefaultTheme, DarkTheme, type Theme as NavigationTheme } from "@react-navigation/native";

export type ThemeName = "light" | "dark" | "sepia";
export type ThemePreference = ThemeName | "system";

export type ThemeTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  border: string;
  borderStrong: string;
  shadow: string;
  overlay: string;
  inputBackground: string;
  inputText: string;
  placeholder: string;
  icon: string;
  iconMuted: string;
  success: string;
  danger: string;
  warning: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

export type AppTheme = {
  name: ThemeName;
  isDark: boolean;
  colors: ThemeTokens;
};

const lightColors: ThemeTokens = {
  background: "#F7F8FC",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceMuted: "#F3F4F6",
  text: "#111827",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  primary: "#E11D48",
  primaryText: "#FFFFFF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  shadow: "rgba(15, 23, 42, 0.12)",
  overlay: "rgba(17, 24, 39, 0.55)",
  inputBackground: "#F3F4F6",
  inputText: "#111827",
  placeholder: "#6B7280",
  icon: "#111827",
  iconMuted: "#6B7280",
  success: "#15803D",
  danger: "#B91C1C",
  warning: "#B45309",
  tint: "#E11D48",
  tabIconDefault: "#6B7280",
  tabIconSelected: "#E11D48",
};

const darkColors: ThemeTokens = {
  background: "#0B0F14",
  surface: "#111827",
  surfaceElevated: "#172033",
  surfaceMuted: "#1F2937",
  text: "#F9FAFB",
  textSecondary: "#E5E7EB",
  textMuted: "#9CA3AF",
  primary: "#FB7185",
  primaryText: "#111827",
  border: "#243244",
  borderStrong: "#334155",
  shadow: "rgba(0, 0, 0, 0.45)",
  overlay: "rgba(0, 0, 0, 0.72)",
  inputBackground: "#172033",
  inputText: "#F9FAFB",
  placeholder: "#9CA3AF",
  icon: "#F9FAFB",
  iconMuted: "#9CA3AF",
  success: "#4ADE80",
  danger: "#F87171",
  warning: "#FBBF24",
  tint: "#FB7185",
  tabIconDefault: "#9CA3AF",
  tabIconSelected: "#FB7185",
};

export const themeRegistry: Record<ThemeName, AppTheme> = {
  light: {
    name: "light",
    isDark: false,
    colors: lightColors,
  },
  dark: {
    name: "dark",
    isDark: true,
    colors: darkColors,
  },
  sepia: {
    name: "sepia",
    isDark: false,
    colors: {
      background: "#F5ECD7",
      surface: "#FAF4E8",
      surfaceElevated: "#FFFDF5",
      surfaceMuted: "#EDE3C8",
      text: "#3B2A1A",
      textSecondary: "#5C3D2E",
      textMuted: "#8B6B4A",
      primary: "#C0392B",
      primaryText: "#FFFFFF",
      border: "#D4B896",
      borderStrong: "#B8956A",
      shadow: "rgba(60,30,10,0.15)",
      overlay: "rgba(40,20,5,0.60)",
      inputBackground: "#F0E6CC",
      inputText: "#3B2A1A",
      placeholder: "#8B6B4A",
      icon: "#3B2A1A",
      iconMuted: "#8B6B4A",
      success: "#27AE60",
      danger: "#C0392B",
      warning: "#F39C12",
      tint: "#C0392B",
      tabIconDefault: "#8B6B4A",
      tabIconSelected: "#C0392B",
    },
  },
};

export const getTheme = (themeName: ThemeName) => themeRegistry[themeName];

export const toNavigationTheme = (theme: AppTheme): NavigationTheme => {
  const baseTheme = theme.isDark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };
};