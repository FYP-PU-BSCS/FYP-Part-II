import React from 'react';
import { Stack } from 'expo-router';
import { ChildDataProvider, useChildData } from './context/ChildDataContext';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { userSession, t } = useChildData();

  // Agar translation dictionary load ho gayi hai, toh buffering nahi hogi
  if (!t) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!userSession ? (
        // 🔒 Agar login nahi hai, toh sirf login screen dikhegi (Neeche wale tabs poori tarah hidden rahenge)
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      ) : (
        // 🔓 Login hote hi bina kisi buffering ke direct protected tabs visible ho jayenge
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ChildDataProvider>
      <RootLayoutNav />
    </ChildDataProvider>
  );
}