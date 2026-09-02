import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { fetchRecentlyViewed, getLocalRecentlyViewed } from "@/utils/recentlyViewed";
import axios from "axios";
import { useAppTheme } from "@/theme/ThemeProvider";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { fetchWithCache } from "@/utils/apiCache";
import { API_BASE_URL } from "@/constants/Api";

// const categories = [
//   {
//     id: 1,
//     name: "Men",
//     image:
//       "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Women",
//     image:
//       "https://images.unsplash.com/photo-1618244972963-dbad0c4abf18?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     name: "Kids",
//     image:
//       "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     name: "Beauty",
//     image:
//       "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
//   },
// ];

// const products = [
//   {
//     id: 1,
//     name: "Casual White T-Shirt",
//     brand: "Roadster",
//     price: "₹499",
//     discount: "60% OFF",
//     image:
//       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Denim Jacket",
//     brand: "Levis",
//     price: "₹2499",
//     discount: "40% OFF",
//     image:
//       "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     name: "Summer Dress",
//     brand: "ONLY",
//     price: "₹1299",
//     discount: "50% OFF",
//     image:
//       "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     name: "Classic Sneakers",
//     brand: "Nike",
//     price: "₹3499",
//     discount: "30% OFF",
//     image:
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
//   },
// ];

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

// Fallbacks removed per user directive. Live data only.

export default function Home() {
  const router = useRouter();
  const { colors } = useAppTheme();
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
        console.log("Home fetch fallback:", error);
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
        
        // Pad to 20 products max and min
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

        if (isActive) {
          setRecentlyViewed(local.slice(0, 20));
        }
      };

      void loadRecentlyViewed();

      return () => {
        isActive = false;
      };
    }, [user?._id])
  );
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.text }]}>MYNTRA</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
        }}
        style={styles.banner}
      />

      <View style={{ padding: 15, backgroundColor: "#e8f5e9", margin: 15, borderRadius: 8, borderWidth: 1, borderColor: "#4caf50" }}>
        <TouchableOpacity 
          style={{ backgroundColor: "#4caf50", padding: 12, borderRadius: 6, alignItems: "center" }}
          onPress={async () => {
            try {
              alert("Testing...");
              const res = await axios.get(`${API_BASE_URL}/product`);
              alert(`Success! Status: ${res.status}. Found ${res.data?.length || 0} products.`);
            } catch (e: any) {
              alert(`Failed: ${e.message}`);
            }
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>TEST BACKEND CONNECTION</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SHOP BY CATEGORY</Text>
          <TouchableOpacity style={styles.viewAll} onPress={() => router.navigate("/(tabs)/categories")}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            <ChevronRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : !categories || categories.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No categories available</Text>
          ) : (
            categories.map((category: any) => (
              <TouchableOpacity 
                key={category._id} 
                style={[styles.categoryCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                onPress={() => router.navigate("/(tabs)/categories")}
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>DEALS OF THE DAY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dealsScroll}
        >
          {deals.map((deal) => (
            <TouchableOpacity 
              key={deal.id} 
              style={styles.dealCard}
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>TRENDING NOW</Text>
        </View>
        <View style={styles.productsGrid}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : !product || product.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No Product available</Text>
          ) : ( 
            <View style={styles.productsGrid}>
              {product.map((product: any) => (
                <TouchableOpacity
                  key={product._id}
                  style={[styles.productCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                  onPress={() => handleProductPress(product._id)}
                >
                  <Image
                    source={{ uri: product.images[0
                      
                    ] }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                      <Text style={[styles.brandName, { color: colors.textMuted }]}>{product.brand}</Text>
                      <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={[styles.productPrice, { color: colors.text }]}>₹{product.price}</Text>
                        {product.discount ? (
                          <Text style={[styles.discount, { color: colors.primary }]}>{product.discount}% OFF</Text>
                        ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENTLY VIEWED</Text>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => router.push("/recently-viewed")}
          >
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
                <Image
                  source={{ uri: item.images?.[0] }}
                  style={styles.recentImage}
                />
                  <Text style={[styles.brandName, { color: colors.textMuted }]}>{item.brand}</Text>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                  <Text style={[styles.productPrice, { color: colors.text }]}>₹{item.price}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* ── Personalized Recommendations / Cold-start Fallback ── */}
      <RecommendationCarousel
        userId={user?._id}
        excludeIds={recentlyViewed.map((i: any) => i._id)}
        title="Recommended for You"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  searchButton: {
    padding: 8,
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
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
    color: "#3e3e3e",
  },
  recentCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  recentImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#ff3f6c",
    marginRight: 5,
  },
  categoriesScroll: {
    marginHorizontal: -15,
  },
  categoryCard: {
    width: 100,
    marginHorizontal: 8,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  categoryName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#3e3e3e",
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
    marginHorizontal: -8,
  },
  productCard: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    color: "#ff3f6c",
    fontWeight: "500",
  },
  loader: {
    marginTop: 50,
  },
});
