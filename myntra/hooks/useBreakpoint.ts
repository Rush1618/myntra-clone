import { useWindowDimensions } from "react-native";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= 1024;
}

export function useIsTabletOrAbove(): boolean {
  const { width } = useWindowDimensions();
  return width >= 768;
}
