/**
 * Root Layout - Responsive navigation for Web and Mobile
 * Web: Sidebar navigation
 * Mobile (iOS/Android): Bottom tab navigation
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { UserProvider } from '../contexts/UserContext';
import { Sidebar } from '../components/web/Sidebar';
import { Colors, Spacing } from '../constants/theme';
import { initDatabase } from '../services/database';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Tab configuration for mobile
const tabScreens = [
  { name: 'index', title: 'Dashboard', icon: 'home' },
  { name: 'food', title: 'Food', icon: 'restaurant' },
  { name: 'coach', title: 'AI Coach', icon: 'chatbubbles' },
  { name: 'premium', title: 'Premium', icon: 'diamond' },
  { name: 'more', title: 'More', icon: 'menu' },
];

// Determine if we should show sidebar (web on larger screens)
function useShouldShowSidebar(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= 768;
}

export default function RootLayout() {
  const showSidebar = useShouldShowSidebar();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize SQLite database
        await initDatabase();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <SubscriptionProvider>
      <UserProvider>
        <StatusBar style="light" />
        
        {showSidebar ? (
          // WEB LAYOUT: Sidebar + Content
          <WebLayout />
        ) : (
          // MOBILE LAYOUT: Bottom Tabs
          <MobileTabLayout />
        )}
      </UserProvider>
    </SubscriptionProvider>
  );
}

/**
 * Web Layout - Sidebar navigation on left, content on right
 */
function WebLayout() {
  return (
    <View style={styles.webContainer}>
      <Sidebar />
      <View style={styles.webContent}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="food" />
          <Stack.Screen name="water" />
          <Stack.Screen name="coach" />
          <Stack.Screen name="recipes" />
          <Stack.Screen name="planner" />
          <Stack.Screen name="voice" />
          <Stack.Screen name="form" />
          <Stack.Screen name="badges" />
          <Stack.Screen name="workout" />
          <Stack.Screen name="watch" />
          <Stack.Screen name="premium" />
          <Stack.Screen name="more" />
        </Stack>
      </View>
    </View>
  );
}

/**
 * Mobile Tab Layout - Bottom tab navigation
 */
function MobileTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="diamond" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
      
      {/* Hidden screens accessible via navigation */}
      <Tabs.Screen name="water" options={{ href: null }} />
      <Tabs.Screen name="recipes" options={{ href: null }} />
      <Tabs.Screen name="planner" options={{ href: null }} />
      <Tabs.Screen name="voice" options={{ href: null }} />
      <Tabs.Screen name="form" options={{ href: null }} />
      <Tabs.Screen name="badges" options={{ href: null }} />
      <Tabs.Screen name="workout" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  webContent: {
    flex: 1,
    marginLeft: 260, // Sidebar width
  },
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.glassBorder,
    borderTopWidth: 1,
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 20 : Spacing.sm,
    height: Platform.OS === 'ios' ? 88 : 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
