import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Sun, Moon, Palette } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { ThemePreference } from "@/theme/themes";

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Sepia", value: "sepia" },
  { label: "System", value: "system" },
];

/**
 * ThemeToggle — renders a pill-style option selector for Light / Dark / Sepia / System.
 */
export function ThemeToggle() {
  const { colors, preference, setThemePreference } = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        },
      ]}
    >
      {OPTIONS.map(({ label, value }) => {
        const active = preference === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => void setThemePreference(value)}
            activeOpacity={0.75}
            style={[
              styles.btn,
              {
                backgroundColor: active ? colors.primary : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.primaryText : colors.textMuted,
                  fontWeight: active ? "700" : "500",
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * HeaderThemeToggle — compact top-bar mode switch button for header.
 * Displays current mode icon and allows 1-tap switching.
 */
export function HeaderThemeToggle() {
  const { colors, preference, setThemePreference } = useAppTheme();

  const toggleTheme = () => {
    if (preference === "light") {
      void setThemePreference("dark");
    } else if (preference === "dark") {
      void setThemePreference("sepia");
    } else {
      void setThemePreference("light");
    }
  };

  const getIcon = () => {
    if (preference === "dark") {
      return <Moon size={18} color={colors.primary} />;
    }
    if (preference === "sepia") {
      return <Palette size={18} color="#D97706" />;
    }
    return <Sun size={18} color={colors.primary} />;
  };

  const getLabel = () => {
    if (preference === "dark") return "DARK";
    if (preference === "sepia") return "SEPIA";
    return "LIGHT";
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.75}
      style={[
        styles.headerBtn,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        },
      ]}
    >
      {getIcon()}
      <Text style={[styles.headerLabel, { color: colors.text }]}>
        {getLabel()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
