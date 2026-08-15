import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/theme/ThemeProvider";

import { API_BASE_URL } from "@/constants/Api";
const CARD_WIDTH = Dimensions.get("window").width * 0.42;

type Product = {
  _id: string;
  name: string;
  brand: string;
  price: number;
  discount?: number;
  images: string[];
  category?: string;
};

type Props = {
  userId?: string;
  /** Products already on screen — excluded from recs to avoid repetition */
  excludeIds?: string[];
  title?: string;
};

/**
 * RecommendationCarousel — horizontal scrollable list of personalized products.
 *
 * Personalized for logged-in users via browsing history.
 * Falls back to popularity-based sorting for anonymous users / cold-start.
 */
export function RecommendationCarousel({
  userId,
  excludeIds = [],
  title = "Recommended for You",
}: Props) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const isFetching = useRef(false);

  const load = useCallback(async () => {
    if (isFetching.current || !userId) return;
    isFetching.current = true;
    try {
      const exclude = excludeIds.join(",");
      const { data } = await axios.get(`${API_BASE_URL}/recommendations/${userId}`, {
        params: { limit: 20, ...(exclude ? { exclude } : {}) },
      });
      setProducts(data.recommendations ?? []);
      setPersonalized(data.meta?.personalized ?? false);
    } catch {
      // Silently fail — component just won't render
    } finally {
      isFetching.current = false;
    }
  }, [userId, excludeIds.join(",")]);

  useEffect(() => {
    void load();
  }, [load]);

  if (products.length === 0) return null;

  const renderProduct = ({ item }: { item: Product }) => {
    const discountedPrice = item.discount
      ? Math.round(item.price * (1 - item.discount / 100))
      : null;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push(`/product/${item._id}` as any)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.images?.[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={[styles.brand, { color: colors.textMuted }]} numberOfLines={1}>
            {item.brand}
          </Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              ₹{discountedPrice ?? item.price}
            </Text>
            {item.discount ? (
              <Text style={[styles.discount, { color: colors.success }]}>
                {item.discount}% off
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {personalized && (
          <Text style={[styles.chip, { backgroundColor: colors.surfaceMuted, color: colors.primary }]}>
            For You
          </Text>
        )}
      </View>
      <FlatList
        data={products}
        keyExtractor={(p) => p._id}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: "700" },
  chip: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  list: { paddingHorizontal: 16 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    backgroundColor: "#F3F4F6",
  },
  info: { padding: 10 },
  brand: { fontSize: 11, letterSpacing: 0.3, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: "600", lineHeight: 18, marginBottom: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 14, fontWeight: "700" },
  discount: { fontSize: 12, fontWeight: "600" },
});
