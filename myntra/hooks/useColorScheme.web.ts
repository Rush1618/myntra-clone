import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

import { useOptionalAppTheme } from "@/theme/ThemeProvider";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const themeContext = useOptionalAppTheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (themeContext) {
    return themeContext.resolvedThemeName;
  }

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
