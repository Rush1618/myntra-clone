import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { ThemePreference } from "@/theme/themes";

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Sepia", value: "sepia" },
  { label: "System", value: "system" },
];

/**
 * ThemeToggle — renders a pill-style 3-option selector for Light / Dark / System.
 * Adding more themes only requires adding to the OPTIONS array and updating themes.ts.
 * Zero other component changes needed.
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
});
