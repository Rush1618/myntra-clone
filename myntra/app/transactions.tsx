import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Download, FileText } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const API_BASE = "http://192.168.0.114:5000";
const PAGE_SIZE = 20;

type Order = {
  _id: string;
  invoiceId?: string;
  createdAt: string;
  date?: string;
  status: string;
  paymentMethod: string;
  paymentStatus?: string;
  total: number;
};

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  Processing: { bg: "#FEF3C7", text: "#92400E" },
  Shipped:    { bg: "#DBEAFE", text: "#1D4ED8" },
  Delivered:  { bg: "#D1FAE5", text: "#065F46" },
  Cancelled:  { bg: "#FEE2E2", text: "#991B1B" },
};

export default function TransactionsScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const isFetching = useRef(false);

  const fetchOrders = useCallback(
    async (p: number, reset = false, currentFilter = statusFilter) => {
      if (!user?._id || isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      try {
        const params: any = { page: p, limit: PAGE_SIZE, sortBy: "createdAt", order: "desc" };
        if (currentFilter) {
          params.status = currentFilter;
        }
        const { data } = await axios.get(`${API_BASE}/Order/user/${user._id}`, {
          params,
        });
        setOrders((prev) => (reset ? data.orders : [...prev, ...data.orders]));
        setTotalPages(data.pagination?.pages ?? 1);
      } catch {
        // Silent fail — show existing data
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [user?._id, statusFilter]
  );

  useEffect(() => {
    void fetchOrders(1, true);
  }, []);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    void fetchOrders(1, true, status);
  };

  const loadMore = () => {
    if (page < totalPages && !loading) {
      const next = page + 1;
      setPage(next);
      void fetchOrders(next);
    }
  };

  const downloadCSV = () => {
    if (!user?._id) return;
    void Linking.openURL(`${API_BASE}/export/orders/${user._id}/csv`);
  };

  const downloadReceipt = (orderId: string) => {
    void Linking.openURL(`${API_BASE}/export/orders/${orderId}/receipt`);
  };

  const badge = (status: string) =>
    STATUS_BADGE[status] ?? { bg: colors.surfaceMuted, text: colors.textMuted };

  const renderItem = ({ item }: { item: Order }) => {
    const b = badge(item.status);
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : item.date ?? "—";

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={[styles.invoiceId, { color: colors.textMuted }]}>
              {item.invoiceId ?? item._id.slice(-8).toUpperCase()}
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>Rs. {item.total?.toFixed(2)}</Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>{dateStr}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: b.bg }]}>
            <Text style={[styles.badgeText, { color: b.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        <View style={styles.cardBottom}>
          <Text style={[styles.paymentInfo, { color: colors.textSecondary }]}>
            {item.paymentMethod}
            {item.paymentStatus ? ` · ${item.paymentStatus}` : ""}
          </Text>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() => downloadReceipt(item._id)}
            activeOpacity={0.7}
          >
            <FileText size={14} color={colors.primary} />
            <Text style={[styles.receiptText, { color: colors.primary }]}>Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filterOptions = [
    { label: "All", value: "" },
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Transactions</Text>
        <TouchableOpacity onPress={downloadCSV} style={styles.exportBtn} activeOpacity={0.7}>
          <Download size={18} color={colors.primary} />
          <Text style={[styles.exportText, { color: colors.primary }]}>CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <FlatList
          data={filterOptions}
          keyExtractor={(item) => item.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = statusFilter === item.value;
            return (
              <TouchableOpacity
                onPress={() => handleFilterChange(item.value)}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    {
                      color: isSelected ? colors.primaryText : colors.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List */}
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <FileText size={56} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No transactions found
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "700" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  exportText: { fontSize: 14, fontWeight: "600" },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtnText: {
    fontSize: 13,
  },
  list: { padding: 16, gap: 12 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  invoiceId: { fontSize: 11, letterSpacing: 0.5, fontFamily: "SpaceMono" },
  amount: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  dateText: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  cardDivider: { height: 1, marginVertical: 12 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paymentInfo: { fontSize: 13 },
  receiptBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  receiptText: { fontSize: 13, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
