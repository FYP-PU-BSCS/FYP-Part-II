import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { useChildData } from '../context/ChildDataContext';

export default function TabLayout() {
  const { t } = useChildData();

  if (!t) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#27ae60', 
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f2f6',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* 1️⃣ HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.home || 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2️⃣ NEW ENTRY */}
      <Tabs.Screen
        name="entry"
        options={{
          title: t.entry || 'New Entry',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3️⃣ SYNC */}
      <Tabs.Screen
        name="sync"
        options={{
          title: t.sync || 'Sync',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 4️⃣ LEARN */}
      <Tabs.Screen
        name="learn"
        options={{
          title: t.learn || 'Learn',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 5️⃣ SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings || 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}