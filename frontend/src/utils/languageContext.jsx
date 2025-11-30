import React, { createContext, useState, useContext, useEffect } from 'react';

// Create translation objects for English and Hindi
const translations = {
  English: {
    // App name
    appName: 'PlantCare AI',
    
    // Dashboard additional translations
    welcomeBack: 'Welcome back',
    farmer: 'Farmer',
    
    // Farm Ledger
    farmFinancialLedger: 'Farm Financial Ledger',
    addNewEntry: 'Add New Entry',
    note: 'Note',
    optionalDetails: 'Optional details about this expense',
    addEntry: 'Add Entry',
    totalFarmExpenses: 'Total Farm Expenses',
    
    // Dashboard stats
    activeFarms: 'Active Farms',
    cropsMonitored: 'Crops Monitored',
    diseaseScans: 'Disease Scans',
    healthScore: 'Health Score',
    
    // Quick actions
    scanPlantDisease: 'Scan Plant Disease',
    uploadPlantDesc: 'Upload plant images for AI analysis',
    calculateFertilizer: 'Calculate Fertilizer',
    optimizeFertilizerDesc: 'Optimize your fertilizer usage',
    farmAnalytics: 'Farm Analytics',
    viewStatsDesc: 'View farm statistics & charts',
    pestCalc: 'Pesticide Calculator',
    preciseDosesDesc: 'Precise application & safety',
    weatherForecast: 'Weather Forecast',
    weatherInsightsDesc: 'View farming weather insights',
    communityForum: 'Community Forum',
    connectFarmersDesc: 'Connect with other farmers',
    
    // Farm overview
    farmOverview: 'Farm Overview',
    scanPlants: 'Scan Plants',
    farmTools: 'Farm Tools',
    optimizeNutrients: 'Optimize Nutrients',
    calculateDoses: 'Calculate Doses',
    estimateReturns: 'Estimate Returns',
    forecastData: 'Forecast Data',
    trackExpenses: 'Track Expenses',
    viewInsights: 'View Insights',
    connectLearn: 'Connect & Learn',
    
    // Common UI elements
    dashboard: 'Dashboard',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    
    // Navigation menu items
    home: 'Home',
    about: 'About',
    diseases: 'Disease Detection',
    calculator: 'Calculators',
    cropsMenu: 'Crops',
    weather: 'Weather',
    forum: 'Community Forum',
    analytics: 'Analytics',
    farms: 'Active Farms',
    farmLedger: 'Farm Ledger',
    
    // Settings page
    appCustomization: 'App Customization',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    notifications: 'Notifications',
    enableWeather: 'Enable daily weather alerts',
    enableDisease: 'Enable disease/pest outbreak alerts',
    enableCommunity: 'Enable community/forum notifications',
    dataManagement: 'Data Management & Support',
    exportData: 'Export my data (CSV)',
    deleteAccount: 'Delete my account',
    feedback: 'Feedback & Suggestions',
    contactSupport: 'Contact Support',
    saveSettings: 'Save Settings',
    
    // Disease detection
    uploadImage: 'Upload Image',
    selectImage: 'Select Plant Image',
    analyzing: 'Analyzing your plant...',
    results: 'Results',
    diseaseDetected: 'Disease Detected',
    confidence: 'Confidence',
    symptoms: 'Symptoms',
    treatments: 'Treatments',
    organicTreatments: 'Organic Treatments',
    chemicalTreatments: 'Chemical Treatments',
    prevention: 'Prevention',
    sessionExpired: 'Your session has expired. Please log in again.',
    uploadFailed: 'Failed to upload image',
    loginRequired: 'You must be logged in to use this feature. Please log in and try again.',
    selectImageFirst: 'Please select an image first.',
    
    // Calculator pages
    fertilizerCalculator: 'Fertilizer Calculator',
    pesticideCalculator: 'Pesticide Calculator',
    profitCalculator: 'Profit Calculator',
    cropType: 'Crop Type',
    fieldSize: 'Field Size',
    soilType: 'Soil Type',
    calculate: 'Calculate',
    
    // Weather page
    currentWeather: 'Current Weather',
    forecast: 'Forecast',
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall: 'Rainfall',
    wind: 'Wind',
    
    // Farm management
    addFarm: 'Add Farm',
    farmName: 'Farm Name',
    location: 'Location',
    size: 'Size',
    crops: 'Crops',
    addTransaction: 'Add Transaction',
    transactionType: 'Transaction Type',
    amount: 'Amount',
    date: 'Date',
    category: 'Category',
    description: 'Description',
    income: 'Income',
    expense: 'Expense',
    
    // Forum
    createPost: 'Create Post',
    title: 'Title',
    content: 'Content',
    reply: 'Reply',
    replies: 'Replies',
    
    // Alerts and messages
    success: 'Success!',
    error: 'Error!',
    loading: 'Loading...',
    confirmDelete: 'Are you sure you want to delete?',
    saved: 'Changes saved successfully!',
    loginPrompt: 'Please login to continue',
    
    // Delete account
    deleteWarning: 'Warning: This cannot be undone!',
    deleteConfirm: 'Are you sure you want to permanently delete your PlantCare AI account and all associated data?',
    deleteItems: 'This will permanently delete all your:',
    farmData: 'Farm data and crop information',
    transactionRecords: 'Transaction records',
    diseaseScanHistory: 'Disease scan history',
    farmNotes: 'Farm notes',
    calculatorHistory: 'Calculator history',
    forumPosts: 'Forum posts and replies',
    deleting: 'Deleting...',
  },
  Hindi: {
    // App name
    appName: 'प्लांटकेयर एआई',
    
    // Dashboard stats
    activeFarms: 'सक्रिय खेत',
    cropsMonitored: 'निगरानी की गई फसलें',
    diseaseScans: 'रोग स्कैन',
    healthScore: 'स्वास्थ्य स्कोर',
    
    // Quick actions
    scanPlantDisease: 'पौधों के रोग स्कैन करें',
    uploadPlantDesc: 'एआई विश्लेषण के लिए पौधों की छवियां अपलोड करें',
    calculateFertilizer: 'उर्वरक की गणना करें',
    optimizeFertilizerDesc: 'अपने उर्वरक उपयोग को अनुकूलित करें',
    farmAnalytics: 'खेत विश्लेषण',
    viewStatsDesc: 'खेत के आंकड़े और चार्ट देखें',
    pestCalc: 'कीटनाशक कैलकुलेटर',
    preciseDosesDesc: 'सटीक अनुप्रयोग और सुरक्षा',
    weatherForecast: 'मौसम का पूर्वानुमान',
    weatherInsightsDesc: 'खेती के मौसम की जानकारी देखें',
    communityForum: 'किसान मंच',
    connectFarmersDesc: 'अन्य किसानों से जुड़ें',
    
    // Farm overview
    farmOverview: 'खेत अवलोकन',
    scanPlants: 'पौधे स्कैन करें',
    farmTools: 'खेती के उपकरण',
    optimizeNutrients: 'पोषक तत्व अनुकूलित करें',
    calculateDoses: 'खुराक की गणना करें',
    estimateReturns: 'अनुमानित लाभ',
    forecastData: 'पूर्वानुमान डेटा',
    trackExpenses: 'खर्च ट्रैक करें',
    viewInsights: 'अंतर्दृष्टि देखें',
    connectLearn: 'जुड़ें और सीखें',
    
    // Dashboard additional translations
    welcomeBack: 'वापसी पर स्वागत है',
    farmer: 'किसान',
    
    // Farm Ledger
    farmFinancialLedger: 'खेत वित्तीय खाता',
    addNewEntry: 'नया प्रविष्टि जोड़ें',
    note: 'नोट',
    optionalDetails: 'इस खर्च के बारे में वैकल्पिक विवरण',
    addEntry: 'प्रविष्टि जोड़ें',
    totalFarmExpenses: 'कुल खेत खर्च',
    
    // Common UI elements
    dashboard: 'डैशबोर्ड',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    signup: 'साइन अप',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    back: 'वापस',
    next: 'आगे',
    
    // Navigation menu items
    home: 'होम',
    about: 'हमारे बारे में',
    diseases: 'रोग पहचान',
    calculator: 'कैलकुलेटर',
    cropsMenu: 'फसलें',
    weather: 'मौसम',
    forum: 'किसान मंच',
    analytics: 'विश्लेषण',
    farms: 'सक्रिय खेत',
    farmLedger: 'खेत का हिसाब-किताब',
    
    // Settings page
    appCustomization: 'ऐप अनुकूलन',
    language: 'भाषा',
    theme: 'थीम',
    light: 'लाइट',
    dark: 'डार्क',
    notifications: 'सूचनाएं',
    enableWeather: 'दैनिक मौसम अलर्ट सक्षम करें',
    enableDisease: 'बीमारी/कीट प्रकोप अलर्ट सक्षम करें',
    enableCommunity: 'समुदाय/मंच सूचनाएं सक्षम करें',
    dataManagement: 'डेटा प्रबंधन और सहायता',
    exportData: 'मेरा डेटा निर्यात करें (CSV)',
    deleteAccount: 'मेरा खाता हटाएं',
    feedback: 'प्रतिक्रिया और सुझाव',
    contactSupport: 'सहायता से संपर्क करें',
    saveSettings: 'सेटिंग्स सहेजें',
    
    // Disease detection
    uploadImage: 'छवि अपलोड करें',
    selectImage: 'पौधे की छवि चुनें',
    analyzing: 'आपके पौधे का विश्लेषण किया जा रहा है...',
    results: 'परिणाम',
    diseaseDetected: 'रोग का पता चला',
    confidence: 'विश्वास स्तर',
    symptoms: 'लक्षण',
    treatments: 'उपचार',
    organicTreatments: 'जैविक उपचार',
    chemicalTreatments: 'रासायनिक उपचार',
    prevention: 'रोकथाम',
    sessionExpired: 'आपका सत्र समाप्त हो गया है। कृपया फिर से लॉग इन करें।',
    uploadFailed: 'छवि अपलोड करने में विफल',
    loginRequired: 'इस सुविधा का उपयोग करने के लिए आपको लॉग इन होना चाहिए। कृपया लॉग इन करें और फिर से प्रयास करें।',
    selectImageFirst: 'कृपया पहले एक छवि चुनें।',
    
    // Calculator pages
    fertilizerCalculator: 'उर्वरक कैलकुलेटर',
    pesticideCalculator: 'कीटनाशक कैलकुलेटर',
    profitCalculator: 'लाभ कैलकुलेटर',
    cropType: 'फसल का प्रकार',
    fieldSize: 'खेत का आकार',
    soilType: 'मिट्टी का प्रकार',
    calculate: 'गणना करें',
    
    // Weather page
    currentWeather: 'वर्तमान मौसम',
    forecast: 'पूर्वानुमान',
    temperature: 'तापमान',
    humidity: 'नमी',
    rainfall: 'वर्षा',
    wind: 'हवा',
    
    // Farm management
    addFarm: 'खेत जोड़ें',
    farmName: 'खेत का नाम',
    location: 'स्थान',
    size: 'आकार',
    crops: 'फसलें',
    addTransaction: 'लेनदेन जोड़ें',
    transactionType: 'लेनदेन का प्रकार',
    amount: 'राशि',
    date: 'तारीख',
    category: 'श्रेणी',
    description: 'विवरण',
    income: 'आय',
    expense: 'व्यय',
    
    // Forum
    createPost: 'पोस्ट बनाएं',
    title: 'शीर्षक',
    content: 'सामग्री',
    reply: 'जवाब दें',
    replies: 'जवाब',
    
    // Alerts and messages
    success: 'सफल!',
    error: 'त्रुटि!',
    loading: 'लोड हो रहा है...',
    confirmDelete: 'क्या आप वाकई हटाना चाहते हैं?',
    saved: 'परिवर्तन सफलतापूर्वक सहेजे गए!',
    loginPrompt: 'जारी रखने के लिए कृपया लॉगिन करें',
    
    // Delete account
    deleteWarning: 'चेतावनी: इसे वापस नहीं किया जा सकता!',
    deleteConfirm: 'क्या आप वाकई अपना प्लांटकेयर एआई खाता और सभी संबंधित डेटा स्थायी रूप से हटाना चाहते हैं?',
    deleteItems: 'यह स्थायी रूप से आपके सभी निम्न को हटा देगा:',
    farmData: 'खेत का डेटा और फसल की जानकारी',
    transactionRecords: 'लेनदेन रिकॉर्ड',
    diseaseScanHistory: 'रोग स्कैन इतिहास',
    farmNotes: 'खेत के नोट्स',
    calculatorHistory: 'कैलकुलेटर इतिहास',
    forumPosts: 'मंच पोस्ट और जवाब',
    deleting: 'हटा रहा है...',
  }
};

// Create the language context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or default to English
  const [language, setLanguage] = useState(
    localStorage.getItem('plantcare_language') || 'English'
  );

  // Get translations for current language
  const currentTranslations = translations[language] || translations.English;

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('plantcare_language', language);
    // If we need to notify the backend about language change, we could add an API call here
  }, [language]);

  // Function to change language
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  // Function to translate text
  const t = (key) => {
    return currentTranslations[key] || key; // Return the key itself if translation not found
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};