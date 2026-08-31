import {
  StyleSheet,
  Image,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Search, X, FolderX, RefreshCw, ShoppingBag } from "lucide-react-native";
import axios from "axios";
import { useAppTheme } from "@/theme/ThemeProvider";
import { API_BASE_URL } from "@/constants/Api";
import { fetchWithCache } from "@/utils/apiCache";

export default function TabTwoScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setcategories] = useState<any[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchproduct = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setFetchError(null);
      const res = await axios.get(`${API_BASE_URL}/category`);
      const data = res.data;
      if (Array.isArray(data)) {
        setcategories(data);
      } else if (data && Array.isArray(data.categories)) {
        setcategories(data.categories);
      } else {
        setcategories([]);
      }
    } catch (error: any) {
      console.log("Categories fetch error:", error?.message || error);
      setFetchError(error?.message || "Failed to load categories from server");
      setcategories([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchproduct();
  }, [fetchproduct]);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
  };
  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };
  const filtercategories = categories?.filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.some((subcategory: any) =>
        subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      category.productId.some(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );
  const selectedcategorydata = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;
  const renderProducts = (products: any) => {
    return products?.map((product: any) => {
      if (!product || typeof product === 'string') return null;
      return (
        <TouchableOpacity
          key={product._id}
          style={styles.productCard}
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
      );
    });
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Categories</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBackground }]}>
          <Search size={20} color={colors.iconMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.inputText }]}
            placeholder="Search for products, brands and more"
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={colors.iconMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchproduct(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading && !isRefreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading categories...</Text>
          </View>
        ) : (!categories || categories.length === 0 || filtercategories?.length === 0) ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceMuted }]}>
              <FolderX size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? "No Matching Categories" : "No Categories Available"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery
                ? `No categories or products found matching "${searchQuery}".`
                : fetchError
                ? fetchError
                : "Unable to load categories right now. Please check your connection and tap below to retry."}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => fetchproduct(true)}
              activeOpacity={0.8}
            >
              <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!selectedCategory && (
              <View style={styles.categoriesGrid}>
                {filtercategories?.map((category: any) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[styles.categoryCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                    onPress={() => handleCategorySelect(category._id)}
                  >
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                    />
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.subcategories}>
                          {category?.subcategory?.map((sub: any, index: any) => (
                            <TouchableOpacity
                              key={index}
                              style={[styles.subcategoryTag, { backgroundColor: colors.surfaceMuted }]}
                              onPress={() => handleSubcategorySelect(sub)}
                            >
                              <Text style={[styles.subcategoryText, { color: colors.textSecondary }]}>{sub}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {selectedcategorydata && (
          <View style={styles.categoryDetail}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back to Categories</Text>
              </TouchableOpacity>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {selectedcategorydata.name}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesScroll}
            >
              {selectedcategorydata.subcategory.map((sub: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryButton,
                    { backgroundColor: colors.surfaceMuted },
                    selectedSubcategory === sub && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handleSubcategorySelect(sub)}
                >
                  <Text
                    style={[
                      styles.subcategoryButtonText,
                      { color: colors.text },
                      selectedSubcategory === sub && { color: colors.primaryText },
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.productsGrid}>
              {renderProducts(
                selectedcategorydata?.productId?.filter((p: any) => {
                  if (!selectedSubcategory) return true;
                  const subLower = selectedSubcategory.toLowerCase();
                  // Strip the "s" off the end of "T-Shirts" or "Shirts" to make matching easier on demo data
                  const searchTerm = subLower.endsWith('s') ? subLower.slice(0, -1) : subLower;
                  return (
                    p.name.toLowerCase().includes(searchTerm) || 
                    (p.description && p.description.toLowerCase().includes(searchTerm))
                  );
                })
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    padding: 15,
  },
  categoryCard: {
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: 150,
  },
  categoryInfo: {
    padding: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subcategories: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subcategoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  subcategoryText: {
    fontSize: 14,
  },
  categoryDetail: {
    flex: 1,
    padding: 15,
  },
  categoryHeader: {
    marginBottom: 15,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subcategoriesScroll: {
    marginBottom: 15,
  },
  subcategoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  subcategoryButtonText: {
    fontSize: 14,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 320,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#FF3F6C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
