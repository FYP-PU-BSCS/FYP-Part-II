import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChildData } from '../context/ChildDataContext';

export default function SettingsScreen() {
  const { isUrdu, setIsUrdu, t, logoutUser, userSession } = useChildData();

  const handleSettingsLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: "cancel" },
      { 
        text: t.logout, 
        style: 'destructive', 
        onPress: () => {
          logoutUser(); // Clears user token and kicks back to frosted login instantly
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isUrdu ? 'ترتیبات گائیڈ' : 'Application Settings'}</Text>
      </View>

      <View style={styles.contentBody}>
        {/* CURRENT ACTIVE USER PROFILE PROFILE BADGE */}
        {userSession && (
          <View style={[styles.profileCard, isUrdu && { flexDirection: 'row-reverse' }]}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color="#27ae60" />
            </View>
            <View style={[styles.profileInfo, { alignItems: isUrdu ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.profileName}>{userSession.name}</Text>
              <Text style={styles.profileRole}>{userSession.role} • CNIC: {userSession.cnic}</Text>
            </View>
          </View>
        )}

        {/* LANGUAGE TOGGLE OPTION */}
        <TouchableOpacity 
          style={[styles.settingRowBtn, isUrdu && { flexDirection: 'row-reverse' }]} 
          onPress={() => setIsUrdu(!isUrdu)}
        >
          <View style={[styles.leftRowGroup, isUrdu && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="language-outline" size={22} color="#475569" style={{ marginHorizontal: 8 }} />
            <Text style={styles.rowLabelText}>{isUrdu ? 'زبان تبدیل کریں (Language)' : 'Switch App Language'}</Text>
          </View>
          <Text style={styles.langBadgeStatus}>{isUrdu ? 'اردو' : 'English'}</Text>
        </TouchableOpacity>

        {/* SECURE SYSTEM LOGOUT BUTTON */}
        <TouchableOpacity 
          style={[styles.settingRowBtn, styles.logoutBorder, isUrdu && { flexDirection: 'row-reverse' }]} 
          onPress={handleSettingsLogout}
        >
          <View style={[styles.leftRowGroup, isUrdu && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="log-out-outline" size={22} color="#e74c3c" style={{ marginHorizontal: 8 }} />
            <Text style={[styles.rowLabelText, { color: '#e74c3c', fontWeight: 'bold' }]}>
              {t.logout}
            </Text>
          </View>
          <Ionicons name={isUrdu ? "chevron-back" : "chevron-forward"} size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#27ae60', paddingTop: 50, paddingBottom: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  contentBody: { padding: 16 },
  
  profileCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  avatarCircle: { width: 44, height: 44, backgroundColor: '#e8f8f5', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, paddingHorizontal: 12 },
  profileName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  profileRole: { fontSize: 12, color: '#64748b', marginTop: 2 },

  settingRowBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  leftRowGroup: { flexDirection: 'row', alignItems: 'center' },
  rowLabelText: { fontSize: 14, color: '#334155' },
  langBadgeStatus: { fontSize: 12, color: '#27ae60', fontWeight: 'bold', backgroundColor: '#e8f8f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  logoutBorder: { borderColor: '#fde8e8', backgroundColor: '#fff' }
});