import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChildData } from '../context/ChildDataContext';

export default function LearnAndSupportScreen() {
  const { isUrdu } = useChildData();
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  // Manual FAQ Database (System Rules + Medical Polio Awareness)
  const faqDatabase = [
    {
      q: "What are the initial symptoms of Polio?",
      qUrdu: "پولیو کی ابتدائی علامات کیا ہیں؟",
      a: "Initial symptoms include high fever, fatigue, headache, vomiting, stiffness in the neck, and severe pain in the limbs. In acute cases, it directly attacks the nervous system, leading to permanent muscle paralysis, usually in the legs.",
      aUrdu: "ابتدائی علامات میں شدید بخار، تھکاوٹ، سر درد، قے، گردن کا اکڑنا اور اعضاء (ہاتھ پاؤں) میں درد شامل ہے۔ شدید صورتوں میں یہ اعصابی نظام پر حملہ کرتا ہے جس سے جسمانی معذوری (فالج) ہو جاتی ہے، جو زیادہ تر ٹانگوں کو متاثر کرتی ہے۔"
    },
    {
      q: "Why is the Polio Vaccine so important?",
      qUrdu: "پولیو کی ویکسین لگانا کیوں ضروری ہے؟",
      a: "Polio has no cure; prevention through vaccination is the only solution. Every time a child receives oral polio drops, their immunity increases. Vaccinating every child is crucial to breaking the transmission loop and eradicating the virus fully from Pakistan.",
      aUrdu: "پولیو کا کوئی علاج نہیں ہے، صرف ویکسینیشن کے ذریعے ہی اس سے بچا جا سکتا ہے۔ جتنی بار بچے کو قطرے پلائے جاتے ہیں، ان کی مدافعت اتنی ہی مضبوط ہوتی ہے۔ پاکستان سے اس وائرس کے خاتمے کے لیے ہر بچے کو قطرے پلانا فرض ہے۔"
    },
    {
      q: "Are Polio drops safe for newborn and sick children?",
      qUrdu: "کیا نوائیدہ اور بیمار بچوں کے لیے پولیو کے قطرے محفوظ ہیں؟",
      a: "Yes, polio drops are completely safe for newborns, infants, and even minorly sick or malnourished children. In fact, sick children with lower immunity need this protection even more urgently.",
      aUrdu: "جی ہاں، پولیو کے قطرے نوزائیدہ بچوں اور معمولی بیمار یا کمزور بچوں کے لیے بالکل محفوظ ہیں۔ بلکہ کمزور مدافعت والے بچوں کو اس تحفظ کی زیادہ ضرورت ہوتی ہے۔"
    },
    {
      q: "What is Zero Dose?",
      qUrdu: "زیرو ڈوز (Zero Dose) کیا ہے؟",
      a: "A 'Zero Dose' child is any infant or child who has never received even a single dose of the routine immunization vaccines (specifically the oral polio vaccine) since birth.",
      aUrdu: "زیرو ڈوز سے مراد وہ بچہ ہے جس کو پیدائش کے بعد سے حفاظتی ٹیکوں یا پولیو کے قطرے کی ایک بھی خوراک نہ ملی ہو۔"
    },
    {
      q: "How to handle a persistent refusal?",
      qUrdu: "مسلسل انکار کرنے والے والدین کو کیسے مائل کریں؟",
      a: "Do not argue. Listen carefully to their misconceptions, explain the irreversible paralysis symptoms softly, document the reason profile completely via your screening dashboard, and highlight that multiple tracking visits are permitted before records are locked.",
      aUrdu: "بحث نہ کریں۔ ان کے تحفظات کو غور سے سنیں، انہیں پولیو کی معذوری اور علامات کے بارے میں نرمی سے بتائیں، ڈیش بورڈ پر انکار کی وجہ درج کریں، اور سسٹم رولز کے مطابق اگلی وزٹ کے لیے ٹیم کو گائیڈ کریں۔"
    },
    {
      q: "What does 'Static Locked' status mean?",
      qUrdu: "'Static Locked' اسٹیٹس کا کیا مطلب ہے؟",
      a: "A profile becomes static locked when a child is marked fully vaccinated, or when the system limits are reached (such as 3 consecutive recorded refusal or not-home visits). Locked records prevent further tracking changes.",
      aUrdu: "جب کوئی بچہ پولیو کے قطرے پی لے یا ۳ مسلسل معلوماتی کوششیں (جیسے گھر پر نہ ہونا یا انکار) مکمل ہو جائیں تو سسٹم ریکارڈ کو لاک کر دیتا ہے تاکہ ڈیٹا تبدیل نہ ہو سکے۔"
    },
    {
      q: "When will the field data sync?",
      qUrdu: "فیلڈ ڈیٹا کب سنک (Sync) ہوتا ہے؟",
      a: "Data saves locally on your storage instantly. You can perform an active cloud upload by clicking the quick sync button on your main dashboard or visiting the dedicated Sync tab when connected to mobile internet.",
      aUrdu: "ڈیٹا فوری طور پر لوکل اسٹوریج میں محفوظ ہو جاتا ہے۔ آپ انٹرنیٹ کنکشن دستیاب ہونے پر مین ڈیش بورڈ یا سنک ٹیب سے کلاؤڈ پر اپلوڈ کر سکتے ہیں۔"
    }
  ];

  const toggleFaqAccordion = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP HEADER */}
      <View style={styles.appHeader}>
        <Text style={styles.headerTitleText}>
          {isUrdu ? 'معلومات اور فیلڈ گائیڈ' : 'Field Knowledge & FAQ'}
        </Text>
      </View>

      <ScrollView style={styles.scrollLayout} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        
        {/* INSTRUCTION CARD */}
        <View style={[styles.infoCard, isUrdu && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="information-circle-outline" size={24} color="#27ae60" style={isUrdu ? { marginLeft: 10 } : { marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoCardTitle, isUrdu && { textAlign: 'right' }]}>
              {isUrdu ? "فیلڈ اسسٹنٹ گائیڈ" : "Field Assistant Manual"}
            </Text>
            <Text style={[styles.infoCardDesc, isUrdu && { textAlign: 'right' }]}>
              {isUrdu ? "نیچے دیے گئے سوالات پر کلک کر کے آپ پولیو کی علامات، ویکسینیشن کے فوائد اور سسٹم کے اصول دیکھ سکتے ہیں۔" : "Click on any question below to read about polio symptoms, vaccine safety, and official system tracking rules."}
            </Text>
          </View>
        </View>

        {/* MANUAL FAQs LIST */}
        <View style={styles.sectionWrapper}>
          <Text style={[styles.sectionHeading, isUrdu && { textAlign: 'right' }]}>
            {isUrdu ? 'اہم معلومات اور سوالات (FAQs):' : 'Key Information & FAQs:'}
          </Text>
          
          {faqDatabase.map((item, index) => {
            const isExpanded = activeFaqIndex === index;
            return (
              <View key={index} style={styles.accordionContainer}>
                <TouchableOpacity 
                  style={[styles.accordionHeaderButton, isUrdu && { flexDirection: 'row-reverse' }]} 
                  onPress={() => toggleFaqAccordion(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.faqQuestionText, isUrdu && { textAlign: 'right', flex: 1, marginLeft: 10 }]}>
                    {isUrdu ? item.qUrdu : item.q}
                  </Text>
                  <Ionicons 
                    name={isExpanded ? "chevron-up-circle" : "chevron-down-circle"} 
                    size={20} 
                    color="#27ae60" 
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.accordionBodyContent}>
                    <Text style={[styles.faqAnswerText, isUrdu && { textAlign: 'right', lineHeight: 22 }]}>
                      {isUrdu ? item.aUrdu : item.a}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  appHeader: { backgroundColor: '#27ae60', paddingTop: 50, paddingBottom: 16, alignItems: 'center' },
  headerTitleText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollLayout: { flex: 1, padding: 16 },
  
  // Info Notice Card
  infoCard: { flexDirection: 'row', backgroundColor: '#e8f8f5', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#a3e4d7', alignItems: 'center' },
  infoCardTitle: { fontSize: 15, fontWeight: '700', color: '#117a65', marginBottom: 4 },
  infoCardDesc: { fontSize: 12, color: '#16a085', lineHeight: 18 },

  sectionWrapper: { marginBottom: 24 },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  
  // Accordion UI Layout
  accordionContainer: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', elevation: 1 },
  accordionHeaderButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  faqQuestionText: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  accordionBodyContent: { padding: 16, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  faqAnswerText: { fontSize: 13, color: '#475569', lineHeight: 20 }
});