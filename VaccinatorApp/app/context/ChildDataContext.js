import React, { createContext, useState, useContext, useEffect } from 'react';

const ChildDataContext = createContext();

export const ChildDataProvider = ({ children }) => {
  const [isUrdu, setIsUrdu] = useState(false);
  const [households, setHouseholds] = useState([]); 
  const [editingChild, setEditingChild] = useState(null); 
  
  const [dashboardStats, setDashboardStats] = useState({
    vaccinated: 0,
    refused: 0,
    notHome: 0
  });

  const labels = {
    en: {
      home: "Home", entry: "Entry", sync: "Sync", learn: "Learn", settings: "Settings",
      vaccinations: "Vaccinations Completed Today", assigned: "Assigned Households",
      vaccinated: "Vaccinated", refusals: "Refusals", notHome: "Not Home",
      appLang: "App Language", logout: "Logout", logoutConfirm: "Are you sure?", cancel: "Cancel",
      botHello: "Hello! How can I help?", botFallback: "I don't know that yet.", askQuery: "Ask a question..."
    },
    ur: {
      home: "ہوم", entry: "اندراج", sync: "مطابقت", learn: "سیکھیں", settings: "ترتیبات",
      vaccinations: "آج کی مکمل ویکسینیشن", assigned: "تفویض کردہ گھرانے",
      vaccinated: "ویکسین شدہ", refusals: "انکار", notHome: "گھر پر نہیں",
      appLang: "ایپ کی زبان", logout: "لاگ آؤٹ", logoutConfirm: "کیا آپ لاگ آؤٹ کرنا چاہتے ہیں؟", cancel: "منسوخ",
      botHello: "ہیلو! میں کیا مدد کر سکتا ہوں؟", botFallback: "معذرت، مجھے معلوم نہیں ہے۔", askQuery: "سوال پوچھیں..."
    }
  };

  const t = isUrdu ? labels.ur : labels.en;

  // 1. Create: Generates fresh records with standard explicit IDs
  const addChildLocal = (newChild) => {
    const freshRecord = {
      ...newChild,
      id: Date.now().toString(), // Explicit ID base reference
      status: 'pending',
      naAttempts: 0,
      refusalAttempts: 0,
      isStatic: false,
      reasonOfRefusal: ""
    };
    setHouseholds(prev => [...prev, freshRecord]);
  };

  // 2. Delete: Fixed to guarantee complete clean arrays based on strict ID strings
  const deleteChild = (childId) => {
    setHouseholds(prev => prev.filter(item => String(item.id) !== String(childId)));
    if (editingChild && String(editingChild.id) === String(childId)) {
      setEditingChild(null);
    }
  };

  // 3. Profile Updates
  const updateChildRecord = (updatedChild) => {
    setHouseholds(prev => prev.map(item => String(item.id) === String(updatedChild.id) ? updatedChild : item));
    setEditingChild(null); 
  };

  // 4. Screening Lifecycle Core Logic Engine
  const updateChildStatus = (childId, newStatus, refusalReason = "") => {
    setHouseholds(prev => prev.map(child => {
      if (String(child.id) !== String(childId)) return child;

      let updatedChild = { ...child };
      
      let naAttempts = child.naAttempts || 0;
      let refusalAttempts = child.refusalAttempts || 0;

      // RULE 1: If child is marked Vaccinated at any point (1st, 2nd, or 3rd attempt), lock immediately
      if (newStatus === 'vaccinated') {
        updatedChild.status = 'vaccinated';
        updatedChild.isStatic = true; 
      } 
      // RULE 2: N/A Case. Dynamic for first 2 visits, locks permanently on the 3rd
      else if (newStatus === 'not_home') {
        naAttempts += 1;
        updatedChild.naAttempts = naAttempts;
        updatedChild.status = 'not_home';
        if (naAttempts >= 3) {
          updatedChild.isStatic = true; 
        }
      } 
      // RULE 3: Refusal Case. Saves reason, dynamic for first 2 visits, locks permanently on the 3rd
      else if (newStatus === 'refusal') {
        refusalAttempts += 1;
        updatedChild.refusalAttempts = refusalAttempts;
        updatedChild.status = 'refusal';
        updatedChild.reasonOfRefusal = refusalReason; // Attaches the comment reason
        if (refusalAttempts >= 3) {
          updatedChild.isStatic = true; 
        }
      }

      return updatedChild;
    }));
  };

  // Automatic upper tracking counts synchronization loop
  useEffect(() => {
    const vaccinated = households.filter(c => c.status === 'vaccinated').length;
    const refused = households.filter(c => c.status === 'refusal').length;
    const notHome = households.filter(c => c.status === 'not_home').length;
    
    setDashboardStats({ vaccinated, refused, notHome });
  }, [households]);

  return (
    <ChildDataContext.Provider value={{ 
      households, 
      setHouseholds, 
      dashboardStats, 
      setDashboardStats,
      isUrdu, 
      setIsUrdu, 
      t, 
      addChildLocal,
      deleteChild,
      updateChildRecord,
      updateChildStatus,
      editingChild,
      setEditingChild
    }}>
      {children}
    </ChildDataContext.Provider>
  );
};

export const useChildData = () => {
  const context = useContext(ChildDataContext);
  if (!context) throw new Error("useChildData must be used within a ChildDataProvider");
  return context;
};