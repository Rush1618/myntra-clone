import { Tabs } from 'expo-router';
import React from 'react';
import { Chrome, Heart, Search, ShoppingBag, User } from 'lucide-react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

const NAV_ITEMS = [
  { name: 'index', title: 'Home', icon: Chrome, href: '/' },
  { name: 'categories', title: 'Categories', icon: Search, href: '/categories' },
  { name: 'wishlist', title: 'Wishlist', icon: Heart, href: '/wishlist' },
  { name: 'bag', title: 'Bag', icon: ShoppingBag, href: '/bag' },
  { name: 'profile', title: 'Profile', icon: User, href: '/profile' },
];

function DesktopSidebar() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      <View style={styles.sidebarLogo}>
        <Text style={[styles.logoText, { color: colors.primary }]}>MYNTRA</Text>
      </View>
      <View style={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '');
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.sidebarItem,
                isActive && { backgroundColor: colors.primary + '15' },
              ]}
              onPress={() => router.push(item.href as any)}
            >
              <Icon size={22} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[
                styles.sidebarLabel,
                { color: isActive ? colors.primary : colors.textSecondary },
                isActive && { fontWeight: '700' },
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  const isDesktop = useIsDesktop();

  if (isDesktop && Platform.OS === 'web') {
    return (
      <View style={styles.desktopLayout}>
        <DesktopSidebar />
        <View style={styles.desktopContent}>
          <Tabs
            screenOptions={{
              tabBarStyle: { display: 'none' },
              headerShown: false,
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
            <Tabs.Screen name="wishlist" options={{ title: 'Wishlist' }} />
            <Tabs.Screen name="bag" options={{ title: 'Bag' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
          </Tabs>
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Chrome size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    paddingTop: 24,
  },
  sidebarLogo: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  sidebarNav: {
    paddingTop: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  sidebarLabel: {
    fontSize: 15,
    marginLeft: 14,
  },
  desktopContent: {
    flex: 1,
    overflow: 'hidden',
  },
});
