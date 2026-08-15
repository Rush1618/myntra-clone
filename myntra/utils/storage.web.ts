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
  await Promise.all([
    writeWebValue(STORAGE_KEYS.userId, _id),
    writeWebValue(STORAGE_KEYS.userName, name),
    writeWebValue(STORAGE_KEYS.userEmail, email),
  ]);
};

export const getUserData = async () => {
  const [_id, name, email] = await Promise.all([
    readWebValue(STORAGE_KEYS.userId),
    readWebValue(STORAGE_KEYS.userName),
    readWebValue(STORAGE_KEYS.userEmail),
  ]);

  return { _id, name, email };
};

export const clearUserData = async () => {
  await Promise.all([
    removeWebValue(STORAGE_KEYS.userId),
    removeWebValue(STORAGE_KEYS.userName),
    removeWebValue(STORAGE_KEYS.userEmail),
  ]);
};
