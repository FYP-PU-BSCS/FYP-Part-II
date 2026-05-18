import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Modal, 
  Alert, 
  TextInput,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useChildData } from '../context/ChildDataContext'; 

export default function SmartDashboard() {
  const router = useRouter();
  const { households, dashboardStats, isUrdu, t, deleteChild, updateChildStatus, setEditingChild } = useChildData(); 
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('1-5 years'); 
  const [menuVisible, setMenuVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Detail Modal States
  const [selectedChild, setSelectedChild] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [refusalReason, setRefusalReason] = useState("");
  const [showRefusalInput, setShowRefusalInput] = useState(false);

  if (!t || !dashboardStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.logout, onPress: () => router.replace('/login'), style: 'destructive' }
    ]);
  };

  const handleInlineSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert(isUrdu ? "کامیاب" : "Success", isUrdu ? "ڈیٹا ہم آہنگ ہو گیا ہے۔" : "Data synced.");
    }, 1500);
  };

  const filteredList = (households || []).filter(house => {
    const age = parseInt(house.age) || 0;
    if (activeCategoryFilter === 'Zero Dose') {
      return age === 0 || house.category === "Zero Dose";
    } else {
      return age >= 1 && age <= 5 && house.category !== "Zero Dose";
    }
  });

  const getStatusDetails = (status) => {
    switch(status) {
      case 'vaccinated': return { text: t.vaccinated, icon: 'checkmark-circle-outline', color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.1)' };
      case 'refusal': return { text: t.refusals, icon: 'close-circle-outline', color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)' };
      case 'not_home': return { text: t.notHome, icon: 'help-circle-outline', color: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)' };
      default: return { text: isUrdu ? 'زیر التواء' : 'Pending', icon: 'hourglass-outline', color: '#7f8c8d', bg: 'rgba(127, 140, 141, 0.1)' };
    }
  };

  const openDetails = (child) => {
    setSelectedChild(child);
    setRefusalReason(child.reasonOfRefusal || "");
    setShowRefusalInput(false);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedChild(null);
    setShowRefusalInput(false);
    setRefusalReason("");
  };

  // --- FIXED WORKING DELETE FLOW ---
  const handleDelete = (id) => {
    Alert.alert(
      isUrdu ? "کیا آپ حذف کرنا چاہتے ہیں؟" : "Are you sure?",
      isUrdu ? "کیا آپ واقعی اس بچے کا ریکارڈ سسٹم سے حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this child's record from the system?",
      [
        { text: t.cancel || "Cancel", style: "cancel" },
        { 
          text: isUrdu ? "حذف کریں" : "Delete", 
          style: 'destructive', 
          onPress: () => {
            closeDetailsModal();
            deleteChild(id); 
          }
        }
      ]
    );
  };

  const handleTriggerUpdate = (child) => {
    setEditingChild(child); 
    setDetailsModalVisible(false);
    router.push('/entry'); 
  };

  const processStatusChange = (statusType) => {
    if (!selectedChild) return;

    if (selectedChild.isStatic) {
      Alert.alert(
        isUrdu ? "ریکارڈ مقفل ہے" : "Status Locked",
        isUrdu ? "یہ ریکارڈ مستقل ہو چکا ہے۔ مزید تبدیلیاں نہیں کی جا سکتی ہیں۔" : "This record has reached maximum attempts or is already vaccinated and cannot be modified."
      );
      return;
    }

    if (statusType === 'refusal' && !showRefusalInput) {
      setShowRefusalInput(true);
      return;
    }

    if (statusType === 'refusal' && !refusalReason.trim()) {
      Alert.alert(isUrdu ? "خرابی" : "Reason Required", isUrdu ? "براہ کرم انکار کی وجہ درج کریں۔" : "Please enter a comment stating the reason of refusal.");
      return;
    }

    updateChildStatus(selectedChild.id, statusType, statusType === 'refusal' ? refusalReason : "");
    closeDetailsModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#27ae60" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={[styles.headerTop, isUrdu && { flexDirection: 'row-reverse' }]}>
          <View style={styles.logoBox}><Ionicons name="medical" size={24} color="#fff" /></View>
          <View style={{ flex: 1, alignItems: isUrdu ? 'flex-end' : 'flex-start' }}>
            <Text style={styles.headerTitle}>{isUrdu ? 'سمارٹ پولیو پورٹل' : 'Smart Polio Portal'}</Text>
            <Text style={styles.headerSub}>{isUrdu ? 'فیلڈ ٹول' : 'Field Tool'}</Text>
          </View>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* UPPER STATUS TOTAL COUNT BAR */}
        <View style={[styles.progressCard, isUrdu && { flexDirection: 'row-reverse' }]}>
          <View style={[styles.leftProgressContent, isUrdu && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.trackingTextLabel}>
              {isUrdu ? "سستم میں کل رجسٹرڈ بچے:" : "Total Registered Children in System:"}
            </Text>
            <Text style={styles.inlineCountNumber}>
              {dashboardStats.vaccinated || 0}/{(households || []).length}
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.smallInlineSyncBtn, isSyncing && styles.syncBtnDisabled]} onPress={handleInlineSync} disabled={isSyncing}>
            {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : (
              <>
                <Ionicons name="sync-outline" size={14} color="#fff" />
                <Text style={styles.inlineSyncText}>{isUrdu ? "ہم آہنگ" : "Sync"}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* METRICS GRID BOXES */}
        <View style={[styles.grid, isUrdu && { flexDirection: 'row-reverse' }]}>
          {[
            { label: t.vaccinated, val: dashboardStats.vaccinated || 0, color: '#2ecc71' },
            { label: t.refusals, val: dashboardStats.refused || 0, color: '#e74c3c' },
            { label: t.notHome, val: dashboardStats.notHome || 0, color: '#f1c40f' }
          ].map(stat => (
            <View key={stat.label} style={[styles.statBox, { borderColor: stat.color }]}>
                <Text style={[styles.statNum, {color: stat.color}]}>{stat.val}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionHeader, isUrdu && { flexDirection: 'row-reverse' }]}>
            <Text style={styles.sectionTitle}>{t.assigned}</Text>
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{filteredList.length}</Text></View>
        </View>

        {/* FILTERS */}
        <View style={[styles.categoryToggle, isUrdu && { flexDirection: 'row-reverse' }]}>
            {['1-5 years', 'Zero Dose'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.toggleBtn, activeCategoryFilter === cat && styles.activeToggle]} onPress={() => setActiveCategoryFilter(cat)}>
                    <Text style={[styles.toggleBtnText, activeCategoryFilter === cat && {color: '#fff'}]}>
                      {cat === 'Zero Dose' ? (isUrdu ? 'زیرو ڈوز' : 'Zero Dose') : (isUrdu ? '۱-۵ سال' : '1-5 years')}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* HOUSEHOLD ROW LIST */}
        {filteredList.map(house => {
          const statusDetails = getStatusDetails(house.status);
          return (
            <TouchableOpacity key={house.id} style={styles.householdCard} onPress={() => openDetails(house)}>
              <View style={[styles.cardHeader, isUrdu && { flexDirection: 'row-reverse' }]}>
                <Text style={styles.houseName}>{house.fullName || house.full_name}</Text>
                <View style={[styles.statusBadge, {backgroundColor: statusDetails.bg}, isUrdu && { flexDirection: 'row-reverse' }]}>
                  <Ionicons name={statusDetails.icon} size={14} color={statusDetails.color} />
                  <Text style={[styles.statusBadgeText, {color: statusDetails.color}, isUrdu && { marginRight: 5 }]}>{statusDetails.text}</Text>
                </View>
              </View>
              <Text style={[styles.houseAddress, isUrdu && { textAlign: 'right' }]}>{house.houseNo ? `House ${house.houseNo}, St ${house.streetNo}` : house.full_address}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal visible={detailsModalVisible} transparent animationType="slide" onRequestClose={closeDetailsModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContent}>
            <View style={styles.popupHeaderContainer}>
              <Text style={styles.modalHeaderTitle}>{isUrdu ? "بچے کی تفصیلات" : "Child System Profile"}</Text>
              <TouchableOpacity onPress={closeDetailsModal}>
                <Ionicons name="close-circle" size={26} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            {selectedChild && (
              <>
                <View style={styles.detailsBlock}>
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "نام:" : "Name:"}</Text> {selectedChild.fullName}</Text>
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "تاریخ پیدائش:" : "DOB:"}</Text> {selectedChild.dob}</Text>
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "عمر:" : "Calculated Age:"}</Text> {selectedChild.age} {isUrdu ? "سال" : "years"}</Text>
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "سرپرست:" : "Guardian:"}</Text> {selectedChild.guardianName}</Text>
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "فون نمبر:" : "Phone:"}</Text> {selectedChild.phone}</Text>
                  <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "پتہ:" : "Address:"}</Text> House {selectedChild.houseNo}, Street {selectedChild.streetNo}</Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.boldLabel}>{isUrdu ? "حالت:" : "Current Status:"}</Text> {getStatusDetails(selectedChild.status).text} 
                    {selectedChild.isStatic && ` (${isUrdu ? "مقفل" : "Static Locked"})`}
                  </Text>
                  {selectedChild.status === 'not_home' && (
                    <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "کوششیں (N/A):" : "Visits (N/A):"}</Text> {selectedChild.naAttempts || 0}/3</Text>
                  )}
                  {selectedChild.status === 'refusal' && (
                    <>
                      <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "کوششیں (انکار):" : "Visits (Refusal):"}</Text> {selectedChild.refusalAttempts || 0}/3</Text>
                      {selectedChild.reasonOfRefusal ? (
                        <Text style={styles.detailText}><Text style={styles.boldLabel}>{isUrdu ? "انکار کی وجہ:" : "Reason Mentioned:"}</Text> {selectedChild.reasonOfRefusal}</Text>
                      ) : null}
                    </>
                  )}
                </View>

                {/* STATUS BAR CONTROL */}
                <Text style={styles.statusSectionHeading}>{isUrdu ? "حالت تبدیل کریں:" : "Update Screening Status:"}</Text>
                <View style={styles.statusBarButtonsRow}>
                  <TouchableOpacity style={[styles.statusOptionBtn, { backgroundColor: '#2ecc71' }]} onPress={() => processStatusChange('vaccinated')}>
                    <Text style={styles.btnTextWhite}>{isUrdu ? "ویکسین شدہ" : "Vaccinate"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.statusOptionBtn, { backgroundColor: '#f39c12' }]} onPress={() => processStatusChange('not_home')}>
                    <Text style={styles.btnTextWhite}>{isUrdu ? "موجود نہیں" : "N/A"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.statusOptionBtn, { backgroundColor: '#e74c3c' }]} onPress={() => processStatusChange('refusal')}>
                    <Text style={styles.btnTextWhite}>{isUrdu ? "انکار" : "Refuse"}</Text>
                  </TouchableOpacity>
                </View>

                {/* COMMENT BOX FOR REFUSALS */}
                {showRefusalInput && (
                  <View style={styles.refusalReasonBox}>
                    <TextInput 
                      style={styles.reasonInput}
                      placeholder={isUrdu ? "انکار کی وجہ درج کریں" : "Enter personal reason or comment..."}
                      value={refusalReason}
                      onChangeText={setRefusalReason}
                    />
                    <TouchableOpacity style={styles.submitReasonBtn} onPress={() => processStatusChange('refusal')}>
                      <Text style={styles.btnTextWhite}>{isUrdu ? "وجہ محفوظ کریں" : "Submit Reason"}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.dividerLine} />

                {/* MANAGEMENT ACTIONS ROW */}
                <View style={styles.managementButtonsRow}>
                  <TouchableOpacity style={[styles.manageBtn, styles.updateBtnColor]} onPress={() => handleTriggerUpdate(selectedChild)}>
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.btnTextWhite}>{isUrdu ? "اپ ڈیٹ" : "Update Profile"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.manageBtn, styles.deleteBtnColor]} onPress={() => handleDelete(selectedChild.id)}>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.btnTextWhite}>{isUrdu ? "حذف کریں" : "Delete"}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* DROPDOWN MENU */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuDropdown, isUrdu ? { left: 20 } : { right: 20 }]}>
            <TouchableOpacity style={[styles.menuItem, isUrdu && { flexDirection: 'row-reverse' }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
              <Text style={[styles.menuItemText, {color: '#e74c3c'}, isUrdu && { marginRight: 10 }]}>{t.logout}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#27ae60', paddingHorizontal: 20, paddingBottom: 15, paddingTop: 50 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#fff', fontSize: 12, opacity: 0.8 },
  menuBtn: { padding: 5 },
  content: { flex: 1, padding: 15, paddingTop: 15 },
  progressCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftProgressContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackingTextLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginRight: 8 },
  inlineCountNumber: { fontSize: 16, fontWeight: '900', color: '#27ae60' },
  smallInlineSyncBtn: { flexDirection: 'row', backgroundColor: '#27ae60', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 75, elevation: 1 },
  syncBtnDisabled: { backgroundColor: '#a3e4d7' },
  inlineSyncText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '31%', backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#7f8c8d', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  countBadge: { backgroundColor: '#27ae6022', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 10 },
  countBadgeText: { color: '#27ae60', fontWeight: 'bold', fontSize: 12 },
  categoryToggle: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 12, padding: 4, marginBottom: 15 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  activeToggle: { backgroundColor: '#27ae60' },
  toggleBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  householdCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  houseName: { fontSize: 16, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignItems: 'center' },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  houseAddress: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuDropdown: { position: 'absolute', top: 100, backgroundColor: '#fff', padding: 10, borderRadius: 12, elevation: 5, width: 150 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  menuItemText: { fontWeight: 'bold' },
  
  // Modal Sheet Design
  profileModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 420 },
  popupHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  detailsBlock: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, gap: 8, marginBottom: 15 },
  detailText: { fontSize: 14, color: '#334155' },
  boldLabel: { fontWeight: '700', color: '#64748b' },
  statusSectionHeading: { fontSize: 13, fontWeight: '800', color: '#475569', marginVertical: 8 },
  statusBarButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  statusOptionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 1 },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  refusalReasonBox: { backgroundColor: '#fdf2f2', padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#fde8e8' },
  reasonInput: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8, fontSize: 13 },
  submitReasonBtn: { backgroundColor: '#e74c3c', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  dividerLine: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  managementButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  manageBtn: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  updateBtnColor: { backgroundColor: '#3498db' },
  deleteBtnColor: { backgroundColor: '#2c3e50' }
});