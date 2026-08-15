import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchRecentlyViewed } from "@/utils/recentlyViewed";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "@/theme/ThemeProvider";
import axios from "axios";

export default function RecentlyViewedScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadItems = async () => {
        try {
          setIsLoading(true);
          let entries = await fetchRecentlyViewed(user?._id);
          
          if (entries.length < 20) {
            try {
              const res = await axios.get("http://192.168.0.114:5000/product");
              const allProducts = res.data;
              const localIds = new Set(entries.map((item: any) => item._id));
              const padding = allProducts.filter((p: any) => !localIds.has(p._id));
              entries = [...entries, ...padding].slice(0, 20);
            } catch (e) {
              console.error("Failed to fetch padding products", e);
            }
          }

          if (isActive) {
            setItems(entries.slice(0, 20));
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      void loadItems();

      return () => {
        isActive = false;
      };
    }, [user?._id])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recently Viewed</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No recently viewed products yet</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Open a product and it will appear here, synced across devices when you log in.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {items.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/product/${item._id}`)}
            >
              <Image source={{ uri: item.images?.[0] }} style={styles.image} />
              <Text style={[styles.brand, { color: colors.textMuted }]}>{item.brand}</Text>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.price, { color: colors.text }]}>₹{item.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  grid: {
    padding: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  brand: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
});
