import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2, Bookmark, ShoppingCart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useAppTheme } from "@/theme/ThemeProvider";

const API_BASE = "http://192.168.0.114:5000";

type BagItem = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    images: string[];
  };
  size: string;
  quantity: number;
  savedForLater: boolean;
  priceSnapshot?: number;
  priceChanged?: boolean;
  currentPrice?: number;
};

export default function Bag() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();

  const [activeItems, setActiveItems] = useState<BagItem[]>([]);
  const [savedItems, setSavedItems] = useState<BagItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void fetchBag();
  }, [user]);

  const fetchBag = async () => {
    if (!user?._id) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/bag/${user._id}`);
      // New response shape: { activeItems, savedItems }
      if (data?.activeItems !== undefined) {
        setActiveItems(data.activeItems);
        setSavedItems(data.savedItems);
      } else if (Array.isArray(data)) {
        // Backward compat: old flat array (all active)
        setActiveItems(data.filter((i: BagItem) => !i.savedForLater));
        setSavedItems(data.filter((i: BagItem) => i.savedForLater));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await axios.delete(`${API_BASE}/bag/${itemId}`);
      setActiveItems((p) => p.filter((i) => i._id !== itemId));
      setSavedItems((p) => p.filter((i) => i._id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveForLater = async (item: BagItem) => {
    try {
      await axios.patch(`${API_BASE}/bag/${item._id}/save-for-later`);
      setActiveItems((p) => p.filter((i) => i._id !== item._id));
      setSavedItems((p) => [...p, { ...item, savedForLater: true }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToBag = async (item: BagItem) => {
    try {
      const { data } = await axios.patch(`${API_BASE}/bag/${item._id}/move-to-bag`);
      setSavedItems((p) => p.filter((i) => i._id !== item._id));
      setActiveItems((p) => [...p, data.item ?? { ...item, savedForLater: false }]);
      if (data.priceChanged) {
        Alert.alert(
          "Price Changed",
          `This item's price changed from ₹${item.priceSnapshot} to ₹${data.currentPrice}.`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantityChange = async (item: BagItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await axios.patch(`${API_BASE}/bag/${item._id}/quantity`, { quantity: newQty });
      setActiveItems((p) =>
        p.map((i) => (i._id === item._id ? { ...i, quantity: newQty } : i))
      );
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert("Sync Conflict", "Quantity was updated from another device. Refreshing...");
        void fetchBag();
      }
    }
  };

  const total = activeItems.reduce(
    (sum, item) => sum + (item.currentPrice ?? item.productId.price) * item.quantity,
    0
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Please login to view your bag</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
        {activeItems.length > 0 && (
          <Text style={[styles.headerCount, { color: colors.textMuted }]}>
            {activeItems.length} item{activeItems.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* ── Active Cart Items ── */}
        {activeItems.length === 0 ? (
          <View style={styles.emptySection}>
            <ShoppingBag size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Your bag is empty</Text>
          </View>
        ) : (
          activeItems.map((item) => (
            <View key={item._id} style={[styles.bagItem, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              {/* Price change warning banner */}
              {item.priceChanged && (
                <View style={[styles.priceBanner, { backgroundColor: "#FEF3C7" }]}>
                  <Text style={{ fontSize: 12, color: "#92400E", fontWeight: "600" }}>
                    ⚠️ Price changed from ₹{item.priceSnapshot} → ₹{item.currentPrice}
                  </Text>
                </View>
              )}
              <Image source={{ uri: item.productId?.images?.[0] }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.brandName, { color: colors.textMuted }]}>{item.productId.brand}</Text>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.productId.name}</Text>
                <Text style={[styles.itemSize, { color: colors.textMuted }]}>Size: {item.size}</Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  ₹{item.currentPrice ?? item.productId.price}
                </Text>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.surfaceMuted }]}
                    onPress={() => void handleQuantityChange(item, -1)}
                  >
                    <Minus size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.surfaceMuted }]}
                    onPress={() => void handleQuantityChange(item, 1)}
                  >
                    <Plus size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => void handleSaveForLater(item)}
                  >
                    <Bookmark size={14} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Save for Later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => void handleDelete(item._id)}
                  >
                    <Trash2 size={14} color={colors.danger} />
                    <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* ── Saved for Later ── */}
        {savedItems.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>
              Saved for Later ({savedItems.length})
            </Text>
            {savedItems.map((item) => (
              <View
                key={item._id}
                style={[styles.bagItem, styles.savedItem, { backgroundColor: colors.surfaceMuted, shadowColor: colors.shadow }]}
              >
                <Image source={{ uri: item.productId?.images?.[0] }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.brandName, { color: colors.textMuted }]}>{item.productId.brand}</Text>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.productId.name}</Text>
                  <Text style={[styles.itemSize, { color: colors.textMuted }]}>Size: {item.size}</Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.productId.price}</Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => void handleMoveToBag(item)}
                    >
                      <ShoppingCart size={14} color={colors.primary} />
                      <Text style={[styles.actionText, { color: colors.primary }]}>Move to Bag</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => void handleDelete(item._id)}
                    >
                      <Trash2 size={14} color={colors.danger} />
                      <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── Footer ── */}
      {activeItems.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/checkout")}
          >
            <Text style={[styles.checkoutButtonText, { color: colors.primaryText }]}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  headerCount: { fontSize: 14 },
  content: { flex: 1, padding: 15 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, paddingTop: 80 },
  emptySection: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, marginTop: 20, marginBottom: 20 },
  emptyText: { fontSize: 16 },
  loginButton: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 },
  loginButtonText: { fontSize: 16, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  priceBanner: { paddingHorizontal: 10, paddingVertical: 6 },
  bagItem: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  savedItem: { opacity: 0.85 },
  itemImage: { width: 100, height: 120 },
  itemInfo: { flex: 1, padding: 12 },
  brandName: { fontSize: 13, marginBottom: 3 },
  itemName: { fontSize: 15, marginBottom: 3 },
  itemSize: { fontSize: 13, marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  quantityButton: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  quantity: { marginHorizontal: 12, fontSize: 15 },
  actionRow: { flexDirection: "row", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: 12, fontWeight: "600" },
  footer: { padding: 15, borderTopWidth: 1 },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  totalLabel: { fontSize: 16 },
  totalAmount: { fontSize: 18, fontWeight: "bold" },
  checkoutButton: { padding: 15, borderRadius: 10, alignItems: "center" },
  checkoutButtonText: { fontSize: 16, fontWeight: "bold" },
});
