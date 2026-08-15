import * as SecureStore from "expo-secure-store";
import { Platform, Dimensions } from "react-native";
import axios from "axios";

import { API_BASE_URL } from "@/constants/Api";
const STORAGE_KEY = "recentlyViewed";
const MAX_RECENTLY_VIEWED = 20;

export type RecentlyViewedProduct = {
  _id: string;
  name: string;
  brand: string;
  price: number;
  discount?: string;
  images: string[];
};

export type RecentlyViewedEntry = RecentlyViewedProduct & {
  viewedAt: string;
};

const readStorageValue = async () => {
  try {
    if (Platform.OS === "web") {
      return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    }

    return await SecureStore.getItemAsync(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStorageValue = async (value: string) => {
  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(STORAGE_KEY, value);
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEY, value);
  } catch {
    return;
  }
};

const normalizeEntries = (entries: RecentlyViewedEntry[]) => {
  const byId = new Map<string, RecentlyViewedEntry>();

  entries.forEach((entry) => {
    if (!entry?._id) {
      return;
    }

    const existing = byId.get(entry._id);
    if (!existing || new Date(entry.viewedAt).getTime() >= new Date(existing.viewedAt).getTime()) {
      byId.set(entry._id, entry);
    }
  });

  return Array.from(byId.values())
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
    .slice(0, MAX_RECENTLY_VIEWED);
};

const parseLocalEntries = async () => {
  const rawValue = await readStorageValue();
  if (!rawValue) {
    return [] as RecentlyViewedEntry[];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? normalizeEntries(parsed) : [];
  } catch {
    return [];
  }
};

const persistLocalEntries = async (entries: RecentlyViewedEntry[]) => {
  await writeStorageValue(JSON.stringify(normalizeEntries(entries)));
};

const mapServerEntry = (entry: any): RecentlyViewedEntry | null => {
  const product = entry?.productId;
  if (!product?._id) {
    return null;
  }

  return {
    _id: product._id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    discount: product.discount,
    images: Array.isArray(product.images) ? product.images : [],
    viewedAt: new Date(entry.viewedAt).toISOString(),
  };
};

export const getLocalRecentlyViewed = async () => {
  return parseLocalEntries();
};

export const saveLocalRecentlyViewed = async (entries: RecentlyViewedEntry[]) => {
  await persistLocalEntries(entries);
};

export const clearLocalRecentlyViewed = async () => {
  await writeStorageValue("[]");
};


const MAX_RETRIES = 2;

export const recordRecentlyViewed = async (
  product: RecentlyViewedProduct,
  userId?: string,
  _retry = 0
): Promise<RecentlyViewedEntry[]> => {
  // Optimistic local write — always happens immediately regardless of network
  const entry: RecentlyViewedEntry = {
    ...product,
    viewedAt: new Date().toISOString(),
  };

  const current = await parseLocalEntries();
  const localEntries = normalizeEntries([entry, ...current]);
  await persistLocalEntries(localEntries);

  if (!userId) return localEntries;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/recently-viewed/${userId}/view`,
      {
        productId: product._id,
        viewedAt: entry.viewedAt,
      }
    );

    const merged = (response.data ?? [])
      .map(mapServerEntry)
      .filter(Boolean) as RecentlyViewedEntry[];
    await persistLocalEntries(merged);
    return merged;
  } catch (err: any) {
    // Exponential backoff retry
    if (_retry < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 500 * (_retry + 1)));
      return recordRecentlyViewed(product, userId, _retry + 1);
    }
    // Graceful degradation — local entries are still valid
    return localEntries;
  }
};

export const mergeLocalRecentlyViewedWithServer = async (userId: string) => {
  const localEntries = await parseLocalEntries();

  try {
    const response = await axios.post(
      `${API_BASE_URL}/recently-viewed/${userId}/merge`,
      { items: localEntries }
    );

    const merged = (response.data ?? [])
      .map(mapServerEntry)
      .filter(Boolean) as RecentlyViewedEntry[];
    await persistLocalEntries(merged);
    return merged;
  } catch {
    return localEntries;
  }
};

export const fetchRecentlyViewed = async (userId?: string) => {
  if (!userId) {
    return parseLocalEntries();
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/recently-viewed/${userId}`);
    const serverEntries = (response.data ?? [])
      .map(mapServerEntry)
      .filter(Boolean) as RecentlyViewedEntry[];
    await persistLocalEntries(serverEntries);
    return serverEntries;
  } catch {
    return parseLocalEntries();
  }
};