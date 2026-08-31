import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useAppTheme } from "@/theme/ThemeProvider";
import axios from "axios";
import { ArrowLeft } from "lucide-react-native";
import { API_BASE_URL } from "@/constants/Api";

export default function DealPage() {
  const { title } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useAppTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, [title]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/product`);
      let allProducts = Array.isArray(res?.data) && res.data.length > 0 ? res.data : [];
      
      const filterTitle = String(title || "").toLowerCase();
      
      if (filterTitle.includes("599") || filterTitle.includes("under")) {
        allProducts = allProducts.filter((p: any) => Number(p.price) <= 599);
      } else if (filterTitle.includes("40") || filterTitle.includes("off") || filterTitle.includes("%")) {
        allProducts = allProducts.filter((p: any) => {
          const disc = parseInt(String(p.discount || "0").replace(/[^0-9]/g, ""), 10);
          return disc >= 40 && disc <= 75;
        });
      }
      
      setProducts(allProducts.length > 0 ? allProducts : []);
    } catch (err) {
      console.log("Deals fetch error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {products.length === 0 ? (
           <Text style={{ textAlign: "center", color: colors.text, marginTop: 40, width: "100%" }}>
             No products found for this deal.
           </Text>
        ) : (
          products.map((product: any) => (
            <TouchableOpacity
              key={product._id}
              style={[styles.productCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
              onPress={() => router.push(`/product/${product._id}`)}
            >
              <Image source={{ uri: product.images?.[0] }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.brandName}>{product.brand}</Text>
                <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.text }]}>₹{product.price}</Text>
                  {product.discount ? <Text style={styles.discount}>{product.discount}% OFF</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  grid: {
    padding: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: { width: "100%", height: 200, resizeMode: "cover" },
  productInfo: { padding: 10 },
  brandName: { fontSize: 12, color: "#666", marginBottom: 4 },
  productName: { fontSize: 14, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "center" },
  price: { fontSize: 14, fontWeight: "bold", marginRight: 8 },
  discount: { fontSize: 12, color: "#ff3f6c" },
});
