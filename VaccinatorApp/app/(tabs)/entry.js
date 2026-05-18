import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChildData } from '../context/ChildDataContext'; 

export default function EntryScreen() {
  const { addChildLocal, updateChildRecord, editingChild, setEditingChild, isUrdu } = useChildData();

  const [showGenderModal, setShowGenderModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    dob: new Date().toISOString().split('T')[0], 
    gender: "Male",
    category: "Between 1 - 5 years",
    guardianName: "",
    phone: "+92",
    streetNo: "",
    houseNo: ""
  });

  // Automatically populate form if editing a child, otherwise clear it
  useEffect(() => {
    if (editingChild) {
      setFormData({
        fullName: editingChild.fullName || "",
        dob: editingChild.dob || new Date().toISOString().split('T')[0],
        gender: editingChild.gender || "Male",
        category: editingChild.category || "Between 1 - 5 years",
        guardianName: editingChild.guardianName || "",
        phone: editingChild.phone || "+92",
        streetNo: editingChild.streetNo || "",
        houseNo: editingChild.houseNo || ""
      });
    } else {
      clearForm();
    }
  }, [editingChild]);

  const clearForm = () => {
    setFormData({
      fullName: "",
      dob: new Date().toISOString().split('T')[0],
      gender: "Male",
      category: "Between 1 - 5 years",
      guardianName: "",
      phone: "+92",
      streetNo: "",
      houseNo: ""
    });
  };

  // Input Sanitization Handlers
  const handleNameChange = (key, val) => {
    const cleanVal = val.replace(/[^a-zA-Z\s]/g, "");
    setFormData(prev => ({ ...prev, [key]: cleanVal }));
  };

  const handlePhoneChange = (val) => {
    if (!val.startsWith('+92')) val = '+92';
    const digitsOnly = val.slice(3).replace(/[^0-9]/g, "");
    const finalPhone = '+92' + digitsOnly.slice(0, 10);
    setFormData(prev => ({ ...prev, phone: finalPhone }));
  };

  const handleAddressChange = (key, val) => {
    const cleanVal = val.replace(/[^a-zA-Z0-9\s\-\/\,]/g, "");
    setFormData(prev => ({ ...prev, [key]: cleanVal.slice(0, 10) }));
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Age Calculator
  const calculateAge = (dobString) => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age < 0 ? 0 : age;
  };

  // CRITICAL CORRECTION: Handover execution sequence
  const handleRegister = async () => {
    if (formData.phone.length !== 13) {
      Alert.alert(isUrdu ? "خرابی" : "Validation Error", isUrdu ? "درست فون نمبر درج کریں۔" : "Please enter a valid phone number (10 digits after +92).");
      return;
    }

    if (!formData.fullName.trim() || !formData.guardianName.trim() || !formData.houseNo.trim()) {
      Alert.alert(isUrdu ? "خرابی" : "Validation Error", isUrdu ? "تمام ضروری فیلڈز پُر کریں۔" : "Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const calculatedAgeValue = calculateAge(formData.dob);

      if (editingChild) {
        // Update operational branch logic
        await updateChildRecord({
          ...editingChild, 
          ...formData,
          fullName: formData.fullName.trim(),
          guardianName: formData.guardianName.trim(),
          streetNo: formData.streetNo.trim(),
          houseNo: formData.houseNo.trim(),
          age: calculatedAgeValue.toString()
        });
        Alert.alert(isUrdu ? "کامیاب" : "Updated", isUrdu ? "ریکارڈ کامیابی سے اپ ڈیٹ ہو گیا ہے۔" : "Record updated successfully!");
      } else {
        // Clean creation handover payload parameters
        await addChildLocal({
          fullName: formData.fullName.trim(),
          dob: formData.dob,
          gender: formData.gender,
          category: formData.category,
          guardianName: formData.guardianName.trim(),
          phone: formData.phone,
          streetNo: formData.streetNo.trim(),
          houseNo: formData.houseNo.trim(),
          age: calculatedAgeValue.toString() // Stringified calculation mapping for dashboard filters
        });
        Alert.alert(isUrdu ? "کامیاب" : "Success", isUrdu ? "بچہ رجسٹر ہو گیا ہے۔" : "Child registered successfully!");
      }
      clearForm();
    } catch (error) {
      Alert.alert("Error", "Action execution failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>
            {editingChild ? (isUrdu ? "پروفائل اپ ڈیٹ فارم" : "Update Profile Form") : (isUrdu ? "رجسٹریشن فارم" : "Registration Form")}
          </Text>
          {editingChild && (
            <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditingChild(null)}>
              <Ionicons name="close-circle-outline" size={20} color="#e74c3c" />
              <Text style={styles.cancelEditText}>{isUrdu ? "منسوخ" : "Cancel Edit"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.sectionLabel, isUrdu && { textAlign: 'right' }]}>{isUrdu ? "بچے کی تفصیلات" : "CHILD DETAILS"}</Text>
        <TextInput 
          style={[styles.input, isUrdu && { textAlign: 'right' }]}
          placeholder={isUrdu ? "بچے کا نام" : "Child Name"}
          value={formData.fullName}
          onChangeText={(val) => handleNameChange('fullName', val)}
          maxLength={40}
        />

        <View style={[styles.row, isUrdu && { flexDirection: 'row-reverse' }]}>
          <View style={styles.flexHalf}>
            <Text style={styles.fieldSubLabel}>{isUrdu ? "تاریخ پیدائش:" : "Date of Birth:"}</Text>
            <View style={styles.dateInputWrapper}>
              <TextInput style={styles.dateInputField} placeholder="YYYY-MM-DD" value={formData.dob} onChangeText={(val) => handleInputChange('dob', val)} />
              <Ionicons name="calendar-outline" size={18} color="#7f8c8d" style={styles.dateIcon} />
            </View>
          </View>

          <TouchableOpacity style={[styles.flexHalf, styles.dropdownTrigger, isUrdu && { flexDirection: 'row-reverse' }]} onPress={() => setShowGenderModal(true)}>
            <Text style={styles.dropdownText}>{formData.gender === "Male" ? (isUrdu ? "لڑکا" : "Male") : (isUrdu ? "لڑکی" : "Female")}</Text>
            <Ionicons name="chevron-down" size={18} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.fieldSubLabel}>{isUrdu ? "زمرہ:" : "Category:"}</Text>
          <View style={[styles.categorySelectionRow, isUrdu && { flexDirection: 'row-reverse' }]}>
            {['Between 1 - 5 years', 'Zero Dose'].map((cat) => (
              <TouchableOpacity key={cat} style={[styles.categoryTab, formData.category === cat && styles.activeCategoryTab]} onPress={() => handleInputChange('category', cat)}>
                <Text style={[styles.categoryTabText, formData.category === cat && { color: '#fff' }]}>
                  {cat === 'Zero Dose' ? (isUrdu ? "زیرو ڈوز" : "Zero Dose") : (isUrdu ? "۱-۵ سال" : "1-5 years")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpacing, isUrdu && { textAlign: 'right' }]}>{isUrdu ? "سرپرست کی معلومات" : "GUARDIAN INFO"}</Text>
        <TextInput style={[styles.input, isUrdu && { textAlign: 'right' }]} placeholder={isUrdu ? "سرپرست کا نام" : "Guardian Name"} value={formData.guardianName} onChangeText={(val) => handleNameChange('guardianName', val)} maxLength={40} />
        <TextInput style={[styles.input, { textAlign: 'left' }]} keyboardType="phone-pad" value={formData.phone} onChangeText={handlePhoneChange} maxLength={13} />

        <Text style={[styles.sectionLabel, styles.sectionSpacing, isUrdu && { textAlign: 'right' }]}>{isUrdu ? "پتہ" : "ADDRESS"}</Text>
        <View style={[styles.row, isUrdu && { flexDirection: 'row-reverse' }]}>
          <TextInput style={[styles.input, styles.flexHalf, isUrdu && { textAlign: 'right' }]} placeholder={isUrdu ? "گلی نمبر #" : "Street #"} value={formData.streetNo} onChangeText={(val) => handleAddressChange('streetNo', val)} />
          <TextInput style={[styles.input, styles.flexHalf, isUrdu && { textAlign: 'right' }]} placeholder={isUrdu ? "مکان نمبر #" : "House #"} value={formData.houseNo} onChangeText={(val) => handleAddressChange('houseNo', val)} />
        </View>

        <TouchableOpacity style={[styles.registerButton, editingChild && { backgroundColor: '#3498db' }]} onPress={handleRegister} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>{editingChild ? (isUrdu ? "محفوظ کریں" : "SAVE UPDATES") : (isUrdu ? "رجسٹر کریں" : "REGISTER")}</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* GENDER SELECTION MODAL */}
      <Modal visible={showGenderModal} transparent animationType="slide" onRequestClose={() => setShowGenderModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderModal(false)}>
          <View style={styles.modalContent}>
            {['Male', 'Female'].map((gen) => (
              <TouchableOpacity key={gen} style={styles.modalItem} onPress={() => { handleInputChange('gender', gen); setShowGenderModal(false); }}>
                <Text style={styles.modalItemText}>{gen === "Male" ? (isUrdu ? "لڑکا (Male)" : "Male") : (isUrdu ? "لڑکی (Female)" : "Female")}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 24, paddingTop: 40 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  cancelEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fdf2f2', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fde8e8' },
  cancelEditText: { fontSize: 12, fontWeight: '700', color: '#e74c3c' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#27ae60', letterSpacing: 1, marginBottom: 12 },
  sectionSpacing: { marginTop: 20 },
  fieldSubLabel: { fontSize: 11, color: '#7f8c8d', fontWeight: '700', marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, fontSize: 15, color: '#334155', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  flexHalf: { flex: 1 },
  dateInputWrapper: { flexDirection: 'row', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, alignItems: 'center', paddingRight: 12 },
  dateInputField: { flex: 1, padding: 15, fontSize: 14, color: '#334155', borderWidth: 0 },
  dateIcon: { marginLeft: 5 },
  dropdownTrigger: { flexDirection: 'row', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 15, alignItems: 'center', justifyContent: 'space-between', height: 52, marginTop: 15 },
  dropdownText: { fontSize: 15, color: '#334155' },
  pickerContainer: { marginBottom: 15 },
  categorySelectionRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  categoryTab: { flex: 1, paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  activeCategoryTab: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  categoryTabText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  registerButton: { backgroundColor: '#029664', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, elevation: 2 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalItem: { paddingVertical: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, fontWeight: '600', color: '#334155' }
});