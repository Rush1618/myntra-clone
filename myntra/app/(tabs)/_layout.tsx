import { Tabs } from 'expo-router';
import React from 'react';
import { Chrome, Heart, Search, ShoppingBag, User } from 'lucide-react-native';
import { useAppTheme } from '@/theme/ThemeProvider';
export default function TabLayout() {
  const { colors } = useAppTheme();
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
          tabBarIcon: ({ color ,size}) => <Chrome size={size} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color ,size}) => <Search size={size} color={color}/>,
        }}
      />
        <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color ,size}) => <Heart size={size} color={color}/>,
        }}
      />
        <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color ,size}) => <ShoppingBag size={size} color={color}/>,
        }}
      />
        <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color ,size}) => <User size={size} color={color}/>,
        }}
      />
     
    </Tabs>
  );
}
