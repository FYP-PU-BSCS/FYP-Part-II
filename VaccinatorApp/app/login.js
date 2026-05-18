import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChildData } from './context/ChildDataContext';

export default function LoginScreen() {
  const { loginUser, isUrdu, setIsUrdu } = useChildData();
  
  // Form Fields
  const [fullName, setFullName] = useState('');
  const [cnic, setCnic] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Dropdown States
  const [role, setRole] = useState('UCMO');
  const [area, setArea] = useState('Area A');
  
  // Dropdown Modals Flags
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const rolesList = ['Team', 'UCMO', 'Area Incharge'];
  const areasList = ['Area A', 'Area B', 'Area C'];
  const isAreaEnabled = role === 'Team';

  // 1. CNIC Auto-Formatter & Digit Blocker (XXXXX-XXXXXXX-X)
  const handleCnicChange = (text) => {
    // صرف ہندسے رکھنے کے لیے باقی سب بلاک کریں
    const cleaned = text.replace(/\D/g, '');
    
    let formatted = cleaned;
    if (cleaned.length > 5 && cleaned.length <= 12) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else if (cleaned.length > 12) {
      formatted = `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
    }
    
    // CNIC کی لمبائی 15 کریکٹرز سے زیادہ نہیں ہو سکتی
    if (formatted.length <= 15) {
      setCnic(formatted);
    }
  };

  // 2. Phone Number Digit Blocker & Length Guard (Max 10 Digits after +92)
  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handleAuthSubmit = () => {
    // Basic Empty Fields Check
    if (!fullName.trim() || !cnic.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert(
        isUrdu ? "خرابی" : "Validation Error",
        isUrdu ? "براہ کرم تمام فیلڈز کو مینوئلی پُر کریں۔" : "Please fill out all input fields."
      );
      return;
    }

    // Strict CNIC Format Length Check (Must be exactly 15 characters)
    if (cnic.length !== 15) {
      Alert.alert(
        isUrdu ? "غلط شناختی کارڈ" : "Invalid CNIC",
        isUrdu ? "شناختی کارڈ کا فارمیٹ XXXXX-XXXXXXX-X ہونا لازمی ہے۔" : "CNIC must match the XXXXX-XXXXXXX-X format perfectly."
      );
      return;
    }

    // Strict Phone Number Length Check (Standard Pakistani Mobile Number length without 0)
    if (phone.length !== 10) {
      Alert.alert(
        isUrdu ? "غلط موبائل نمبر" : "Invalid Phone Number",
        isUrdu ? "موبائل نمبر 10 ہندسوں پر مشتمل ہونا چاہیے (مثال: 3001234567)" : "Phone number must be exactly 10 digits (e.g., 3001234567)."
      );
      return;
    }

    setIsLoading(true);

    // Simulate API Auth Request
    setTimeout(() => {
      setIsLoading(false);
      loginUser({ 
        name: fullName, 
        cnic, 
        email,
        phone: `+92${phone}`,
        role, 
        area: isAreaEnabled ? area : 'N/A' 
      });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* LANGUAGE SELECTOR BAR */}
      <View style={styles.langHeaderRow}>
        <TouchableOpacity style={styles.langPill} onPress={() => setIsUrdu(!isUrdu)}>
          <Ionicons name="language" size={14} color="#27ae60" />
          <Text style={styles.langPillText}>{isUrdu ? "English" : "اردو"}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.centerScroller} showsVerticalScrollIndicator={false}>
          
          {/* MAIN FORM CARD */}
          <View style={styles.formCard}>
            <Text style={styles.mainLogoText}>SMART POLIO PORTAL</Text>
            <Text style={styles.authorizedTag}>AUTHORIZED ACCESS ONLY</Text>

            {/* FULL NAME FIELD */}
            <View style={[styles.inputContainer, isUrdu && { flexDirection: 'row-reverse' }]}>
              <TextInput 
                style={[styles.textInput, isUrdu && { textAlign: 'right' }]}
                placeholder={isUrdu ? "پورا نام درج کریں" : "Full Name"}
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* CNIC NUMBER FIELD WITH FORMATTING */}
            <View style={[styles.inputContainer, isUrdu && { flexDirection: 'row-reverse' }]}>
              <TextInput 
                style={[styles.textInput, isUrdu && { textAlign: 'right' }]}
                placeholder={isUrdu ? "xxxxx-xxxxxxx-x" : "xxxxx-xxxxxxx-x"}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={cnic}
                onChangeText={handleCnicChange}
              />
            </View>

            {/* EMAIL ADDRESS FIELD */}
            <View style={[styles.inputContainer, isUrdu && { flexDirection: 'row-reverse' }]}>
              <TextInput 
                style={[styles.textInput, isUrdu && { textAlign: 'right' }]}
                placeholder={isUrdu ? "ای میل ایڈریس" : "Email Address"}
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* PHONE NUMBER FIELD WITH DIGIT LOCK */}
            <View style={[styles.inputContainer, isUrdu && { flexDirection: 'row-reverse' }]}>
              <Text style={styles.phonePrefix}>+92</Text>
              <View style={styles.verticalDivider} />
              <TextInput 
                style={[styles.textInput, { flex: 1 }, isUrdu && { textAlign: 'right' }]}
                placeholder={isUrdu ? "موبائل نمبر (3XXXXXXXXX)" : "Phone Number (3XXXXXXXXX)"}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={phone}
                onChangeText={handlePhoneChange}
              />
            </View>

            {/* PASSWORD FIELD */}
            <View style={[styles.inputContainer, isUrdu && { flexDirection: 'row-reverse' }]}>
              <TextInput 
                style={[styles.textInput, { flex: 1 }, isUrdu && { textAlign: 'right' }]}
                placeholder={isUrdu ? "پاس ورڈ" : "Password"}
                placeholderTextColor="#94a3b8"
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <Ionicons name={secureText ? "eye-off" : "eye"} size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* DUAL DROPDOWN ROW */}
            <View style={styles.dropdownRow}>
              
              {/* ROLE PICKER */}
              <TouchableOpacity 
                style={styles.dropdownBox} 
                onPress={() => setRoleModalVisible(true)}
              >
                <Text style={styles.dropdownValueText}>{role}</Text>
                <Ionicons name="chevron-down" size={14} color="#64748b" />
              </TouchableOpacity>

              {/* AREA PICKER */}
              <TouchableOpacity 
                style={[
                  styles.dropdownBox, 
                  !isAreaEnabled && styles.disabledDropdownBox
                ]} 
                onPress={() => {
                  if (isAreaEnabled) {
                    setAreaModalVisible(true);
                  } else {
                    Alert.alert(
                      isUrdu ? "محدود آپشن" : "Restricted Option",
                      isUrdu ? "ایریا سلیکشن صرف ٹیم رول کے لیے دستیاب ہے۔" : "Area selection is only required and enabled for Team login."
                    );
                  }
                }}
                disabled={!isAreaEnabled}
              >
                <Text style={[
                  styles.dropdownValueText, 
                  !isAreaEnabled && styles.disabledDropdownText
                ]}>
                  {isAreaEnabled ? area : (isUrdu ? "ضرورت نہیں" : "Not Required")}
                </Text>
                <Ionicons name="chevron-down" size={14} color={isAreaEnabled ? "#64748b" : "#cbd5e1"} />
              </TouchableOpacity>

            </View>

            {/* SUBMIT SIGN UP BUTTON */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleAuthSubmit} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>{isUrdu ? "سائن اپ کریں" : "SIGN UP"}</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CUSTOM MODAL FOR ROLE SELECTOR */}
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <FlatList
              data={rolesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalItem, role === item && styles.modalItemActive]}
                  onPress={() => {
                    setRole(item);
                    if (item !== 'Team') {
                      setArea('Area A');
                    }
                    setRoleModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, role === item && styles.modalItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOM MODAL FOR AREA SELECTOR */}
      <Modal visible={areaModalVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setAreaModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <FlatList
              data={areasList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalItem, area === item && styles.modalItemActive]}
                  onPress={() => {
                    setArea(item);
                    setAreaModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, area === item && styles.modalItemTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, 
  langHeaderRow: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-end' },
  langPill: { flexDirection: 'row', backgroundColor: '#e8f8f5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#27ae60' },
  langPillText: { fontSize: 12, color: '#27ae60', fontWeight: 'bold' },
  centerScroller: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  formCard: { backgroundColor: '#fff', width: '100%', maxWidth: 360, borderRadius: 20, padding: 24, alignItems: 'center' },
  mainLogoText: { color: '#1e293b', fontSize: 22, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4, textAlign: 'center' },
  authorizedTag: { color: '#27ae60', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 25, textAlign: 'center' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, width: '100%', height: 50, paddingHorizontal: 16, marginBottom: 14 },
  textInput: { color: '#0f172a', fontSize: 14, width: '100%', height: '100%' },
  phonePrefix: { color: '#334155', fontSize: 14, fontWeight: '600' },
  verticalDivider: { width: 1, height: 20, backgroundColor: '#cbd5e1', marginHorizontal: 10 },
  
  dropdownRow: { flexDirection: 'row', width: '100%', gap: 12, marginBottom: 20 },
  dropdownBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, height: 50, paddingHorizontal: 16 },
  dropdownValueText: { color: '#334155', fontSize: 13, fontWeight: '500' },
  
  disabledDropdownBox: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  disabledDropdownText: { color: '#94a3b8' },

  submitBtn: { backgroundColor: '#00a86b', width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 5, shadowColor: '#00a86b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 2 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', width: '80%', maxWidth: 280, borderRadius: 16, padding: 8, elevation: 5 },
  modalItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, marginVertical: 2 },
  modalItemActive: { backgroundColor: '#e8f8f5' },
  modalItemText: { color: '#334155', fontSize: 14 },
  modalItemTextActive: { color: '#27ae60', fontWeight: 'bold' }
});