const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (isLocalhost ? "http://localhost:5000" : "https://myntra-clone-amber-sigma.vercel.app");
