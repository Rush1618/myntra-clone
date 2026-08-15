import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const handleplaceorder = async() => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await axios.post(`http://192.168.0.114:5000/order/create/${user._id}`, {
        shippingAddress: "123 Main Street, Apt 4B, New York, NY, 10001",
        paymentMethod: "Card",
      });
      router.push("/orders");
    } catch (error) {
      console.log(error);
    }

    
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textMuted}
              defaultValue="John Doe"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Address Line 1"
              placeholderTextColor={colors.textMuted}
              defaultValue="123 Main Street"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Address Line 2"
              placeholderTextColor={colors.textMuted}
              defaultValue="Apt 4B"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="City"
                placeholderTextColor={colors.textMuted}
                defaultValue="New York"
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="State"
                placeholderTextColor={colors.textMuted}
                defaultValue="NY"
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Postal Code"
                placeholderTextColor={colors.textMuted}
                defaultValue="10001"
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Country"
                placeholderTextColor={colors.textMuted}
                defaultValue="United States"
              />
            </View>
          </View>
        </View>
        {/* Payment Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Card Number"
              placeholderTextColor={colors.textMuted}
              defaultValue="**** **** **** 4242"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Expiry Date"
                placeholderTextColor={colors.textMuted}
                defaultValue="12/25"
              />
              <TextInput
                style={[styles.input, styles.halfInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="CVV"
                placeholderTextColor={colors.textMuted}
                defaultValue="***"
              />
            </View>
          </View>
        </View>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹3,798</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹99</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tax</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹190</Text>
            </View>
            <View style={[styles.summaryRow, styles.total, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₹4,087</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.placeOrderButton, { backgroundColor: colors.primary }]}
          onPress={handleplaceorder}
        >
          <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginLeft: 10,
  },
  form: {
    gap: 10,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  summary: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#3e3e3e",
  },
  total: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff3f6c",
  },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  placeOrderButton: {
    backgroundColor: "#ff3f6c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
