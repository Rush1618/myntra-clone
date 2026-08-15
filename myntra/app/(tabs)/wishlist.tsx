import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAppTheme } from "@/theme/ThemeProvider";
import { API_BASE_URL } from "@/constants/Api";

const dummyWishlistItems = [
  {
    _id: "WISH1",
    name: "Premium Cotton T-Shirt",
    brand: "H&M",
    price: 799,
    discount: 40,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop"],
  },
  {
    _id: "WISH2",
    name: "Slim Fit Denim Jacket",
    brand: "Levis",
    price: 2999,
    discount: 30,
    images: ["https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop"],
  },
];

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [wishlist, setwishlist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchproduct();
  }, [user]);
  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bag = await axios.get(
          `${API_BASE_URL}/wishlist/${user._id}`
        );
        if (bag.data && bag.data.length > 0) {
          setwishlist(bag.data);
        } else {
          setwishlist(dummyWishlistItems);
        }
      } catch (error) {
        console.log(error);
        setwishlist(dummyWishlistItems);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handledelete=async(itemid:any)=>{
    try {
      await axios.delete(`${API_BASE_URL}/wishlist/${itemid}`)
      fetchproduct();
    } catch (error) {
      console.log(error)
    }
   
  }
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}> 
            Please login to view your wishlist
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.loginButtonText, { color: colors.primaryText }]}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wishlist</Text>
      </View>

      <ScrollView style={styles.content}>
        {wishlist?.map((item:any, index: number) => {
          const productInfo = item.productId || item;
          const imageUri = Array.isArray(productInfo.images) ? productInfo.images?.[0] : (productInfo.image || productInfo.images);
          const price = productInfo.price;
          const discount = productInfo.discount ? `${productInfo.discount}% OFF` : null;
          
          return (
            <View key={item._id || index} style={[styles.wishlistItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <Image source={{ uri: imageUri }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.brandName, { color: colors.textMuted }]}>{productInfo.brand}</Text>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{productInfo.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, { color: colors.text }]}>₹{price}</Text>
                  {discount && <Text style={[styles.discount, { color: colors.primary }]}>{discount}</Text>}
                </View>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={()=>handledelete(item._id)}>
                <Trash2 size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          );
        })}
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
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  loginButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  wishlistItem: {
    flexDirection: "row",
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
  itemImage: {
    width: 100,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    padding: 15,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  discount: {
    fontSize: 14,
  },
  removeButton: {
    padding: 15,
    justifyContent: "center",
  },
});
