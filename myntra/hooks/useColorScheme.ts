import { useColorScheme as useRNColorScheme } from "react-native";

import { useOptionalAppTheme } from "@/theme/ThemeProvider";

export function useColorScheme() {
	const themeContext = useOptionalAppTheme();

	if (themeContext) {
		return themeContext.resolvedThemeName;
	}

	return useRNColorScheme() ?? "light";
}
