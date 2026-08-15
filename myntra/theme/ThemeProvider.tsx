import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useRNColorScheme } from "react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getTheme, toNavigationTheme, type AppTheme, type ThemeName, type ThemePreference } from "@/theme/themes";

const THEME_STORAGE_KEY = "theme-preference";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedThemeName: ThemeName;
  theme: AppTheme;
  isReady: boolean;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const validPreference =
          storedPreference === "light" ||
          storedPreference === "dark" ||
          storedPreference === "sepia" ||
          storedPreference === "system"
            ? (storedPreference as ThemePreference)
            : "system";

        if (isMounted) {
          setPreference(validPreference);
        }

        if (!storedPreference) {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, "system");
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedThemeName: ThemeName =
    preference === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  const theme = getTheme(resolvedThemeName);

  const setThemePreference = async (nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference);
  };

  const value = useMemo(
    () => ({
      preference,
      resolvedThemeName,
      theme,
      isReady,
      setThemePreference,
    }),
    [isReady, preference, resolvedThemeName, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return {
    ...context,
    navigationTheme: toNavigationTheme(context.theme),
    colors: context.theme.colors,
    isDark: context.theme.isDark,
  };
}

export function useOptionalAppTheme() {
  return useContext(ThemeContext);
}