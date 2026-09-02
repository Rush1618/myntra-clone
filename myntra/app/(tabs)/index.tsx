import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { fetchRecentlyViewed } from "@/utils/recentlyViewed";
import axios from "axios";
import { useAppTheme } from "@/theme/ThemeProvider";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { fetchWithCache } from "@/utils/apiCache";
import { API_BASE_URL } from "@/constants/Api";

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;

  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>([]);
  const [categories, setcategories] = useState<any>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const { user } = useAuth();

  const handleProductPress = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const catData = await fetchWithCache(`${API_BASE_URL}/category`);
        const prodData = await fetchWithCache(`${API_BASE_URL}/product`);
        if (Array.isArray(catData) && catData.length > 0) setcategories(catData);
        if (Array.isArray(prodData) && prodData.length > 0) setproduct(prodData);
      } catch (error) {
        console.log("Home fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const loadRecentlyViewed = async () => {
        let local = await fetchRecentlyViewed(user?._id);
        if (local.length < 20) {
          try {
            const res = await axios.get(`${API_BASE_URL}/product`);
            const allProducts = res.data;
            const localIds = new Set(local.map((item: any) => item._id));
            const padding = allProducts.filter((p: any) => !localIds.has(p._id));
            local = [...local, ...padding].slice(0, 20);
          } catch (e) {
            console.error("Failed to fetch padding products", e);
          }
        }
        if (isActive) setRecentlyViewed(local.slice(0, 20));
      };
      void loadRecentlyViewed();
      return () => { isActive = false; };
    }, [user?._id])
  );

  // Responsive grid columns
  const productColumns = isDesktop ? 4 : isTablet ? 3 : 2;
  const productCardWidth = `${Math.floor(100 / productColumns) - 1}%` as any;
  const maxContentWidth = isDesktop ? 1200 : '100%';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header — only shown on mobile; desktop uses sidebar */}
      {!isDesktop && (
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.logo, { color: colors.text }]}>MYNTRA</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.pageContent, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Hero Banner */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop",
          }}
          style={[styles.banner, isDesktop && styles.bannerDesktop]}
        />

        {/* Desktop: 2-col layout — categories + main */}
        <View style={isDesktop ? styles.desktopGrid : null}>

          {/* Categories */}
          <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>SHOP BY CATEGORY</Text>
              <TouchableOpacity style={styles.viewAll} onPress={() => router.navigate("/(tabs)/categories")}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
                <ChevronRight size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal={!isDesktop}
              showsHorizontalScrollIndicator={false}
              style={!isDesktop ? styles.categoriesScroll : undefined}
              contentContainerStyle={isDesktop ? styles.categoriesDesktopGrid : undefined}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
              ) : !categories || categories.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No categories available</Text>
              ) : (
                categories.map((category: any) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: colors.surface, shadowColor: colors.shadow },
                      isDesktop && styles.categoryCardDesktop,
                    ]}
                    onPress={() => router.navigate("/(tabs)/categories")}
                  >
                    <Image source={{ uri: category.image }} style={[styles.categoryImage, isDesktop && styles.categoryImageDesktop]} />
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {/* Main column: Deals + Products */}
          <View style={isDesktop ? styles.mainColumn : undefined}>
            {/* Deals */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>DEALS OF THE DAY</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsScroll}>
                {deals.map((deal) => (
                  <TouchableOpacity
                    key={deal.id}
                    style={[styles.dealCard, isDesktop && styles.dealCardDesktop]}
                    onPress={() => router.push(`/deal/${encodeURIComponent(deal.title)}`)}
                  >
                    <Image source={{ uri: deal.image }} style={styles.dealImage} />
                    <View style={styles.dealOverlay}>
                      <Text style={styles.dealTitle}>{deal.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Trending Products */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>TRENDING NOW</Text>
              </View>
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
              ) : !product || product.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No Products available</Text>
              ) : (
                <View style={styles.productsGrid}>
                  {product.map((p: any) => (
                    <TouchableOpacity
                      key={p._id}
                      style={[
                        styles.productCard,
                        { backgroundColor: colors.surface, shadowColor: colors.shadow, width: productCardWidth },
                      ]}
                      onPress={() => handleProductPress(p._id)}
                    >
                      <Image source={{ uri: p.images[0] }} style={styles.productImage} />
                      <View style={styles.productInfo}>
                        <Text style={[styles.brandName, { color: colors.textMuted }]}>{p.brand}</Text>
                        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{p.name}</Text>
                        <View style={styles.priceRow}>
                          <Text style={[styles.productPrice, { color: colors.text }]}>₹{p.price}</Text>
                          {p.discount ? (
                            <Text style={[styles.discount, { color: colors.primary }]}>{p.discount}% OFF</Text>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Recently Viewed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENTLY VIEWED</Text>
            <TouchableOpacity style={styles.viewAll} onPress={() => router.push("/recently-viewed")}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyViewed.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recently viewed items yet</Text>
            ) : (
              recentlyViewed.slice(0, 20).map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
                  onPress={() => router.push(`/product/${item._id}`)}
                >
                  <Image source={{ uri: item.images?.[0] }} style={styles.recentImage} />
                  <Text style={[styles.brandName, { color: colors.textMuted }]}>{item.brand}</Text>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                  <Text style={[styles.productPrice, { color: colors.text }]}>₹{item.price}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Recommendations */}
        <RecommendationCarousel
          userId={user?._id}
          excludeIds={recentlyViewed.map((i: any) => i._id)}
          title="Recommended for You"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchButton: {
    padding: 8,
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  bannerDesktop: {
    height: 340,
    borderRadius: 0,
  },
  // Desktop grid: sidebar (categories) + main column
  desktopGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  sectionDesktop: {
    width: 200,
    padding: 0,
  },
  mainColumn: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    marginRight: 5,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
  },
  categoriesScroll: {
    marginHorizontal: -15,
  },
  categoriesDesktopGrid: {
    flexDirection: "column",
    gap: 8,
  },
  categoryCard: {
    width: 100,
    marginHorizontal: 8,
    alignItems: "center",
  },
  categoryCardDesktop: {
    width: "100%",
    marginHorizontal: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  categoryImageDesktop: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  dealsScroll: {
    marginHorizontal: -15,
  },
  dealCard: {
    width: 280,
    height: 150,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  dealCardDesktop: {
    width: 320,
    height: 180,
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 15,
  },
  dealTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 200,
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 13,
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 8,
  },
  discount: {
    fontSize: 13,
    fontWeight: "500",
  },
  recentCard: {
    width: 150,
    marginRight: 12,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  recentImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  loader: {
    marginTop: 50,
  },
});
