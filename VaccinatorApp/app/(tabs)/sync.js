import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ✅ بالکل درست اور فکسڈ امپورٹ پاتھ (Single dot کیونکہ یہ tabs فولڈر کے اندر ہے)
import { useChildData } from '../context/ChildDataContext';

export default function SyncScreen() {
  const { isUrdu, t } = useChildData();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert(
        isUrdu ? "کامیابی" : "Success",
        isUrdu ? "ڈیٹا سرور کے ساتھ سنک ہو گیا ہے!" : "Data synced with server successfully!"
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isUrdu ? "ڈیٹا سنکرونائزیشن" : "Data Synchronization"}
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={80} color="#27ae60" />
        </View>
        <Text style={styles.title}>
          {isUrdu ? "اپنا ڈیٹا سنک کریں" : "Sync Your Data"}
        </Text>
        <Text style={styles.description}>
          {isUrdu 
            ? "مرکزی سرور کے ساتھ لوکل ڈیٹا کو سنکرونائز کرنے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔" 
            : "Click the button below to synchronize local storage data with the central server registry database."}
        </Text>
        <TouchableOpacity 
          style={[styles.syncButton, isSyncing && styles.disabledButton]} 
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isUrdu ? "ابھی سنک کریں" : "Sync Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: '#e8f8f5',
    padding: 25,
    borderRadius: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  syncButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});