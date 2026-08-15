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
} from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { useAppTheme } from "@/theme/ThemeProvider";
import { API_BASE_URL } from "@/constants/Api";

// const categories = [
//   {
//     id: 1,
//     name: "Men",
//     subcategories: [
//       "T-Shirts",
//       "Shirts",
//       "Jeans",
//       "Trousers",
//       "Suits",
//       "Activewear",
//     ],
//     image:
//       "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop",
//     products: [
//       {
//         id: 1,
//         name: "Casual White T-Shirt",
//         brand: "Roadster",
//         price: 499,
//         discount: "60% OFF",
//         image:
//           "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
//       },
//       {
//         id: 2,
//         name: "Denim Jacket",
//         brand: "Levis",
//         price: 2499,
//         discount: "40% OFF",
//         image:
//           "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
//       },
//     ],
//   },
//   {
//     id: 2,
//     name: "Women",
//     subcategories: [
//       "Dresses",
//       "Tops",
//       "Ethnic Wear",
//       "Western Wear",
//       "Activewear",
//     ],
//     image:
//       "https://images.unsplash.com/photo-1618244972963-dbad0c4abf18?w=500&auto=format&fit=crop",
//     products: [
//       {
//         id: 3,
//         name: "Summer Dress",
//         brand: "ONLY",
//         price: 1299,
//         discount: "50% OFF",
//         image:
//           "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
//       },
//     ],
//   },
//   {
//     id: 3,
//     name: "Kids",
//     subcategories: [
//       "Boys Clothing",
//       "Girls Clothing",
//       "Infants",
//       "Toys",
//       "School Essentials",
//     ],
//     image:
//       "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop",
//     products: [],
//   },
//   {
//     id: 4,
//     name: "Beauty",
//     subcategories: [
//       "Makeup",
//       "Skincare",
//       "Haircare",
//       "Fragrances",
//       "Personal Care",
//     ],
//     image:
//       "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
//     products: [],
//   },
//   {
//     id: 5,
//     name: "Accessories",
//     subcategories: ["Watches", "Bags", "Jewellery", "Sunglasses", "Belts"],
//     image:
//       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
//     products: [],
//   },
// ];

export default function TabTwoScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any>(null);
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(`${API_BASE_URL}/category`);
        setcategories(cat.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);
  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (!categories) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Categories not found</Text>
      </View>
    );
  }
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

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]}>
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
});
