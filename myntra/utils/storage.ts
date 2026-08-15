import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  userId: "userid",
  userName: "userName",
  userEmail: "userEmail",
} as const;

const readWebValue = async (key: string) => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeWebValue = async (key: string, value: string) => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    return;
  }
};

const removeWebValue = async (key: string) => {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    return;
  }
};

export const saveUserData = async (
  _id: string,
  name: string,
  email: string
) => {
  if (Platform.OS === "web") {
    await Promise.all([
      writeWebValue(STORAGE_KEYS.userId, _id),
      writeWebValue(STORAGE_KEYS.userName, name),
      writeWebValue(STORAGE_KEYS.userEmail, email),
    ]);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEYS.userId, _id);
  await SecureStore.setItemAsync(STORAGE_KEYS.userName, name);
  await SecureStore.setItemAsync(STORAGE_KEYS.userEmail, email);
};

export const getUserData = async () => {
  if (Platform.OS === "web") {
    const [_id, name, email] = await Promise.all([
      readWebValue(STORAGE_KEYS.userId),
      readWebValue(STORAGE_KEYS.userName),
      readWebValue(STORAGE_KEYS.userEmail),
    ]);
    return { _id, name, email };
  }

  const _id = await SecureStore.getItemAsync(STORAGE_KEYS.userId);
  const name = await SecureStore.getItemAsync(STORAGE_KEYS.userName);
  const email = await SecureStore.getItemAsync(STORAGE_KEYS.userEmail);
  return { _id, name, email };
};

export const clearUserData = async () => {
  if (Platform.OS === "web") {
    await Promise.all([
      removeWebValue(STORAGE_KEYS.userId),
      removeWebValue(STORAGE_KEYS.userName),
      removeWebValue(STORAGE_KEYS.userEmail),
    ]);
    return;
  }

  await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.userName);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.userEmail);
};
