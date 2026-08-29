 import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package,
  ChevronRight,
  MapPin,
  Truck,
  Clock,
  Calendar,
  CreditCard,
  Download,
  FileText
} from "lucide-react-native";
import React from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeProvider";
import { API_BASE_URL } from "@/constants/Api";

const orders = [
  {
    id: "ORD123456",
    date: "15 Mar 2024",
    status: "Delivered",
    items: [
      {
        id: 1,
        name: "White Cotton T-Shirt",
        brand: "H&M",
        size: "L",
        price: 799,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
      },
      {
        id: 2,
        name: "Blue Denim Jacket",
        brand: "Levis",
        size: "M",
        price: 2999,
        image:
          "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
      },
    ],
    total: 4087,
    shippingAddress: "123 Main Street, Apt 4B, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    tracking: {
      number: "TRK789012345",
      carrier: "FedEx",
      estimatedDelivery: "15 Mar 2024",
      currentLocation: "New York City Hub",
      status: "Delivered",
      timeline: [
        {
          status: "Delivered",
          location: "New York, NY",
          timestamp: "15 Mar 2024, 14:30",
        },
        {
          status: "Out for Delivery",
          location: "New York City Hub",
          timestamp: "15 Mar 2024, 09:15",
        },
        {
          status: "Arrived at Delivery Facility",
          location: "New York Distribution Center",
          timestamp: "14 Mar 2024, 23:45",
        },
        {
          status: "Order Shipped",
          location: "New Jersey Warehouse",
          timestamp: "13 Mar 2024, 16:20",
        },
        {
          status: "Order Confirmed",
          location: "Online",
          timestamp: "12 Mar 2024, 10:00",
        },
      ],
    },
  },
  {
    id: "ORD123457",
    date: "10 Mar 2024",
    status: "Delivered",
    items: [
      {
        id: 3,
        name: "Summer Dress",
        brand: "ONLY",
        size: "S",
        price: 1299,
        image:
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
      },
    ],
    total: 1398,
    shippingAddress: "123 Main Street, Apt 4B, New York, NY 10001",
    paymentMethod: "Credit Card ending in 4242",
    tracking: {
      number: "TRK789012346",
      carrier: "UPS",
      estimatedDelivery: "10 Mar 2024",
      currentLocation: "Delivered",
      status: "Delivered",
      timeline: [
        {
          status: "Delivered",
          location: "New York, NY",
          timestamp: "10 Mar 2024, 15:45",
        },
        {
          status: "Order Shipped",
          location: "New Jersey Warehouse",
          timestamp: "08 Mar 2024, 11:30",
        },
        {
          status: "Order Confirmed",
          location: "Online",
          timestamp: "07 Mar 2024, 09:15",
        },
      ],
    },
  },
];

export default function Orders() {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [fetchedOrders, setFetchedOrders] = useState<any>(null);
  useEffect(() => {
    const fetchorder = async () => {
      if (user?._id) {
        try {
          setIsLoading(true);
          const response = await axios.get(
            `${API_BASE_URL}/Order/user/${user._id}`
          );
          const rawOrders = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.orders)
            ? response.data.orders
            : [];
          setFetchedOrders(rawOrders);
        } catch (error) {
          console.log("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchorder();
  }, [user?._id]);
   if (isLoading) {
      return (
        <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  const displayOrders = (Array.isArray(fetchedOrders) && fetchedOrders.length > 0) ? fetchedOrders : orders;

  if (!displayOrders || !Array.isArray(displayOrders)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Order not found</Text>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerInner}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 5, padding: 8, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}
            onPress={() => user && Linking.openURL(`${API_BASE_URL}/Order/export/csv/${user._id}`)}
          >
            <Download size={16} color={colors.text} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContainer}>
        {displayOrders.map((order:any) => {
          const orderKey = order._id || order.id || Math.random().toString();
          const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent");
          const orderItems = Array.isArray(order.items) ? order.items : [];
          const trackingNumber = order.tracking?.number || "TRK-" + String(orderKey).slice(-8).toUpperCase();
          const trackingCarrier = order.tracking?.carrier || "Standard Delivery";
          const timeline = Array.isArray(order.tracking?.timeline) ? order.tracking.timeline : [
            { status: order.status || "Processing", location: "Hub", timestamp: orderDate }
          ];

          return (
          <View key={orderKey} style={[styles.orderCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <TouchableOpacity
              style={[styles.orderHeader, { borderBottomColor: colors.border }]}
              onPress={() => toggleOrderDetails(orderKey)}
            >
              <View>
                <Text style={[styles.orderId, { color: colors.text }]}>Order #{String(orderKey).slice(-8).toUpperCase()}</Text>
                <Text style={[styles.orderDate, { color: colors.textMuted }]}>{orderDate}</Text>
              </View>
              <View style={[styles.statusContainer, { backgroundColor: colors.primary + '20' }]}>
                <Package size={16} color={colors.primary} />
                <Text style={[styles.orderStatus, { color: colors.primary }]}>{order.status || "Processing"}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.itemsContainer}>
              {orderItems.map((item:any, index: number) => {
                const productInfo = item.productId || item;
                const imageUri = Array.isArray(productInfo.images) ? productInfo.images?.[0] : (productInfo.image || productInfo.images);
                return (
                  <View key={item._id || index} style={styles.orderItem}>
                    <Image
                      source={{ uri: imageUri || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={[styles.brandName, { color: colors.textMuted }]}>{productInfo.brand || "Brand"}</Text>
                      <Text style={[styles.itemName, { color: colors.text }]}>{productInfo.name || "Product"}</Text>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.price || productInfo.price || 0}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {expandedOrder === orderKey && (
              <View style={[styles.orderDetails, { borderTopColor: colors.border }]}>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <MapPin size={20} color={colors.text} />
                    <Text style={[styles.detailTitle, { color: colors.text }]}>Shipping Address</Text>
                  </View>
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>{order.shippingAddress || "Registered Delivery Address"}</Text>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <CreditCard size={20} color={colors.text} />
                    <Text style={[styles.detailTitle, { color: colors.text }]}>Payment Method</Text>
                  </View>
                  <Text style={[styles.detailText, { color: colors.textMuted }]}>{order.paymentMethod || "Online Payment"}</Text>
                  
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 }}
                    onPress={() => Linking.openURL(`${API_BASE_URL}/Order/receipt/${order._id || orderKey}`)}
                  >
                    <FileText size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>Download PDF Receipt</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Truck size={20} color={colors.text} />
                    <Text style={[styles.detailTitle, { color: colors.text }]}>Tracking Information</Text>
                  </View>
                  <View style={styles.trackingInfo}>
                    <Text style={[styles.trackingNumber, { color: colors.textMuted }]}>
                      Tracking Number: {trackingNumber}
                    </Text>
                    <Text style={[styles.trackingCarrier, { color: colors.textMuted }]}>
                      Carrier: {trackingCarrier}
                    </Text>
                  </View>

                  <View style={styles.timeline}>
                    {timeline.map((event:any, index:any) => (
                      <View key={index} style={styles.timelineEvent}>
                        <View style={[styles.timelinePoint, { backgroundColor: colors.primary }]} />
                        <View style={styles.timelineContent}>
                          <Text style={[styles.timelineStatus, { color: colors.text }]}>
                            {event.status}
                          </Text>
                          <Text style={[styles.timelineLocation, { color: colors.textMuted }]}>
                            {event.location}
                          </Text>
                          <Text style={[styles.timelineTimestamp, { color: colors.textMuted }]}>
                            {event.timestamp}
                          </Text>
                        </View>
                        {index !== order.tracking.timeline.length - 1 && (
                          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Order Total</Text>
                <Text style={[styles.totalAmount, { color: colors.text }]}>₹{order.total}</Text>
              </View>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => toggleOrderDetails(order._id)}
              >
                <Text style={[styles.detailsButtonText, { color: colors.primary }]}>
                  {expandedOrder === order._id ? "Hide Details" : "View Details"}
                </Text>
                <ChevronRight size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    borderBottomWidth: 1,
  },
  headerInner: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    padding: 15,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  orderCard: {
    backgroundColor: "#fff",
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f4ea",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  orderStatus: {
    fontSize: 14,
    color: "#00b852",
    marginLeft: 5,
  },
  itemsContainer: {
    padding: 15,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: 5,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  itemName: {
    fontSize: 16,
    color: "#3e3e3e",
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailSection: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginLeft: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  trackingInfo: {
    marginBottom: 15,
  },
  trackingNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  trackingCarrier: {
    fontSize: 14,
    color: "#666",
  },
  timeline: {
    marginTop: 15,
  },
  timelineEvent: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff3f6c",
    marginTop: 5,
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 17,
    width: 2,
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  timelineContent: {
    marginLeft: 15,
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: "#999",
  },
  orderFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  detailsButtonText: {
    fontSize: 16,
    color: "#ff3f6c",
    marginRight: 5,
  },
});
