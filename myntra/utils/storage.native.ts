import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  userId: "userid",
  userName: "userName",
  userEmail: "userEmail",
} as const;

export const saveUserData = async (
  _id: string,
  name: string,
  email: string
) => {
  await SecureStore.setItemAsync(STORAGE_KEYS.userId, _id);
  await SecureStore.setItemAsync(STORAGE_KEYS.userName, name);
  await SecureStore.setItemAsync(STORAGE_KEYS.userEmail, email);
};

export const getUserData = async () => {
  const _id = await SecureStore.getItemAsync(STORAGE_KEYS.userId);
  const name = await SecureStore.getItemAsync(STORAGE_KEYS.userName);
  const email = await SecureStore.getItemAsync(STORAGE_KEYS.userEmail);
  return { _id, name, email };
};

export const clearUserData = async () => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.userName);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.userEmail);
};
