import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Package,
  Heart,
  Clock,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Receipt,
} from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeProvider";
import { ThemeToggle, HeaderThemeToggle } from "@/components/ui/ThemeToggle";

const menuItems = [
  { icon: Package, label: "Orders", route: "/orders" },
  { icon: Receipt, label: "Transactions", route: "/transactions" },
  { icon: Clock, label: "Recently Viewed", route: "/recently-viewed" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: CreditCard, label: "Payment Methods", route: "/payments" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, preference, resolvedThemeName } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const handleLogout = () => {
    logout()
    router.replace("/");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isDesktop && (
        <View style={[styles.header, { borderBottomColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <HeaderThemeToggle />
        </View>
      )}

      {/* Theme toggle pinned at top — always visible without scrolling */}
      <View style={[styles.themeBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.themeBarInner}>
          <Text style={[styles.themeBarLabel, { color: colors.textMuted }]}>
            {preference === "system" ? `System (${resolvedThemeName})` : preference.charAt(0).toUpperCase() + preference.slice(1)} mode
          </Text>
          <ThemeToggle />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]}>
        <View style={[styles.innerCard, isDesktop && styles.innerCardDesktop]}>
          {!user ? (
            <View style={styles.emptyState}>
              <User size={64} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Please login to view your profile</Text>
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/login")}
              >
                <Text style={[styles.loginButtonText, { color: colors.primaryText }]}>LOGIN</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.userSection}>
              <View style={[styles.userInfo, { borderBottomColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <User size={40} color={colors.primaryText} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                  <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
                </View>
              </View>

              <View style={[styles.menuSection, { borderTopColor: colors.border }]}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={styles.menuItemLeft}>
                      <item.icon size={24} color={colors.textSecondary} />
                      <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
                    </View>
                    <ChevronRight size={24} color={colors.iconMuted} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.primary }]} onPress={handleLogout}>
                <LogOut size={24} color={colors.primary} />
                <Text style={[styles.logoutText, { color: colors.primary }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 15, paddingTop: 50, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  scrollContent: { flexGrow: 1, padding: 16 },
  desktopScrollContent: { alignItems: 'center' },
  innerCard: { width: '100%', paddingBottom: 32 },
  innerCardDesktop: { maxWidth: 600 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, paddingTop: 60 },
  emptyTitle: { fontSize: 18, marginTop: 20, marginBottom: 20 },
  loginButton: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 },
  loginButtonText: { fontSize: 16, fontWeight: "bold" },
  themeBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  themeBarInner: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    gap: 8,
  },
  themeBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  userSection: {},
  userInfo: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  userDetails: { marginLeft: 15 },
  userName: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  userEmail: { fontSize: 14 },
  menuSection: { marginTop: 8, borderTopWidth: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15, borderBottomWidth: 1 },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuItemLabel: { fontSize: 16, marginLeft: 15 },
  content: { flex: 1 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, marginTop: 20, borderRadius: 10, borderWidth: 1 },
  logoutText: { marginLeft: 10, fontSize: 16, fontWeight: "bold" },
});
