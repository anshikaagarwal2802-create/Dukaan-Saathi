import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Send, 
  Sparkles, 
  Languages, 
  MapPin, 
  Phone, 
  Upload, 
  AlertTriangle, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  Package, 
  User, 
  ChevronRight, 
  CheckCircle, 
  RefreshCw,
  Search,
  Store,
  Printer,
  Download,
  AlertCircle,
  Users,
  Share2,
  Check,
  Keyboard,
  X,
  ArrowLeft
} from 'lucide-react';
import { translations } from './translations';
import { 
  LanguageCode, 
  Shop, 
  Product, 
  UdhaarRecord, 
  SalesRecord, 
  AITip, 
  ExpenseRecord,
  TranslationSet
} from './types';

// Default initial data for simulation if localStorage is empty
const defaultShops: Shop[] = [
  {
    id: 'shop-1',
    name: 'Laxmi General Store',
    ownerName: 'Ramesh Patel',
    phone: '9876543210',
    location: 'Mumbai, MH',
    type: 'manual'
  },
  {
    id: 'shop-2',
    name: 'Saathi Provision Store',
    ownerName: 'Ramesh Patel',
    phone: '9876543210',
    location: 'Pune, MH',
    type: 'digital'
  }
];

const defaultProducts: Record<string, Product[]> = {
  'shop-1': [
    { id: 'p-1', name: 'Amul Butter 500g', buyPrice: 210, sellPrice: 245, unit: 'pcs', stock: 45, soldQuantity: 14, barcode: '8901262010113', category: 'Dairy' },
    { id: 'p-2', name: 'Maggi Family Pack', buyPrice: 92, sellPrice: 95, unit: 'pack', stock: 120, soldQuantity: 32, barcode: '8901058002475', category: 'Noodles' },
    { id: 'p-3', name: 'Ariel Matic 1kg', buyPrice: 145, sellPrice: 170, unit: 'pcs', stock: 24, soldQuantity: 8, barcode: '4902430902267', category: 'Detergents' },
    { id: 'p-4', name: 'Fortune Oil 1L', buyPrice: 140, sellPrice: 155, unit: 'bottle', stock: 80, soldQuantity: 20, barcode: '8906007281412', category: 'Grocery' },
    { id: 'p-5', name: 'Parle-G Gold biscuits', buyPrice: 8, sellPrice: 10, unit: 'pcs', stock: 200, soldQuantity: 55, barcode: '8901166113110', category: 'Snacks' },
    { id: 'p-6', name: 'Tata Salt 1kg', buyPrice: 24, sellPrice: 28, unit: 'pcs', stock: 150, soldQuantity: 12, barcode: '8901058002314', category: 'Spices' }
  ],
  'shop-2': [
    { id: 'p-201', name: 'Dettol Liquid 500ml', buyPrice: 180, sellPrice: 210, unit: 'pcs', stock: 30, soldQuantity: 5, barcode: '8901396345121', category: 'Hygiene' },
    { id: 'p-202', name: 'Colgate MaxFresh', buyPrice: 85, sellPrice: 105, unit: 'pcs', stock: 65, soldQuantity: 22, barcode: '8901117275812', category: 'Dental' },
    { id: 'p-203', name: 'Good Day Butter 50g', buyPrice: 9, sellPrice: 10, unit: 'pcs', stock: 350, soldQuantity: 110, barcode: '8901063140131', category: 'Snacks' }
  ]
};

const defaultUdhaars: Record<string, UdhaarRecord[]> = {
  'shop-1': [
    { id: 'u-1', customerName: 'Rajesh Kumar', phone: '9812345670', amount: 1240, date: '2026-06-01', bills: ['#201', '#212'], daysAgo: 10, status: 'pending', history: [] },
    { id: 'u-2', customerName: "Sunita Ma'am", phone: '9822334455', amount: 450, date: '2026-06-08', bills: ['#245'], daysAgo: 2, status: 'pending', history: [] },
    { id: 'u-3', customerName: 'Amit Sharma', phone: '9944556677', amount: 2100, date: '2026-06-05', bills: ['#219', '#228'], daysAgo: 5, status: 'pending', history: [] },
    { id: 'u-4', customerName: 'Vikas Dubey', phone: '7011223344', amount: 3200, date: '2026-05-25', bills: ['#180'], daysAgo: 16, status: 'pending', history: [] },
    { id: 'u-5', customerName: 'Deepak Patil', phone: '8877665544', amount: 840, date: '2026-06-09', bills: ['#251'], daysAgo: 1, status: 'pending', history: [] }
  ],
  'shop-2': [
    { id: 'u-201', customerName: 'Karan Johar', phone: '9000111222', amount: 4120, date: '2026-06-02', bills: ['#D11'], daysAgo: 8, status: 'pending', history: [] }
  ]
};

const defaultSalesHistory: Record<string, SalesRecord[]> = {
  'shop-1': [
    { id: 's-1', amount: 1240, date: 'Mon', profit: 240, paymentMode: 'cash', itemsCount: 3 },
    { id: 's-2', amount: 1650, date: 'Tue', profit: 320, paymentMode: 'upi', itemsCount: 4 },
    { id: 's-3', amount: 2840, date: 'Wed', profit: 540, paymentMode: 'upi', itemsCount: 7 },
    { id: 's-4', amount: 1450, date: 'Thu', profit: 280, paymentMode: 'cash', itemsCount: 3 },
    { id: 's-5', amount: 2100, date: 'Fri', profit: 420, paymentMode: 'upi', itemsCount: 9 },
    { id: 's-6', amount: 1950, date: 'Sat', profit: 380, paymentMode: 'cash', itemsCount: 5 },
    { id: 's-7', amount: 3290, date: 'Sun', profit: 660, paymentMode: 'upi', itemsCount: 11 }
  ],
  'shop-2': [
    { id: 's-201', amount: 3400, date: 'Mon', profit: 512, paymentMode: 'upi', itemsCount: 8 }
  ]
};

export default function App() {
  // Persistence & Language State
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('saathi_lang');
    return (saved as LanguageCode) || 'en';
  });

  const [customTranslations, setCustomTranslations] = useState<Record<string, TranslationSet>>(() => {
    const saved = localStorage.getItem('saathi_custom_translations');
    return saved ? JSON.parse(saved) : {};
  });

  const [customLanguagesList, setCustomLanguagesList] = useState<{ code: string; name: string }[]>(() => {
    const saved = localStorage.getItem('saathi_custom_languages_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [isOpenCustomLangModal, setIsOpenCustomLangModal] = useState<boolean>(false);
  const [typedCustomLang, setTypedCustomLang] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Synced Owner / WhatsApp Contacts state
  const [deviceContacts, setDeviceContacts] = useState<{ id: string; name: string; phone: string; origin: string; importCount: number }[]>(() => {
    const saved = localStorage.getItem('saathi_device_contacts');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'c-1', name: 'Shubham Agarwal (Raju Halwai)', phone: '9876543210', origin: 'WhatsApp', importCount: 1 },
      { id: 'c-2', name: 'Dr. Manoj Verma', phone: '9123456789', origin: 'Google Contacts', importCount: 0 },
      { id: 'c-3', name: 'Anjali Gupta (Saree Niketan)', phone: '9812347590', origin: 'Google Contacts', importCount: 1 },
      { id: 'c-4', name: 'Pappu Kirana Customer', phone: '8099887766', origin: 'WhatsApp', importCount: 0 },
      { id: 'c-5', name: 'Sunil Chawla (Supplier)', phone: '7011223399', origin: 'Google Contacts', importCount: 0 },
      { id: 'c-6', name: 'Meena Tai (Aji Milk)', phone: '9922883344', origin: 'WhatsApp', importCount: 1 },
      { id: 'c-7', name: 'Satish Deshmukh', phone: '8100112233', origin: 'WhatsApp', importCount: 0 },
      { id: 'c-8', name: 'Rohan Sharma (Colleague)', phone: '9012345678', origin: 'WhatsApp', importCount: 0 }
    ];
  });

  const [isOpenContactsModal, setIsOpenContactsModal] = useState<boolean>(false);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactOrigin, setNewContactOrigin] = useState<'WhatsApp' | 'Google Contacts'>('WhatsApp');
  const [isSyncingContacts, setIsSyncingContacts] = useState<boolean>(false);

  const systemLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' }
  ];

  const allLanguages = (() => {
    const uniques: { code: string; name: string }[] = [];
    const seenCodes = new Set<string>();
    const seenNames = new Set<string>();

    for (const l of systemLanguages) {
      uniques.push(l);
      seenCodes.add(l.code.toLowerCase());
      seenNames.add(l.name.toLowerCase().trim());
      // Also block spelling matches of some common ones
      if (l.code === 'en') {
        seenCodes.add('english');
        seenNames.add('english');
      }
      if (l.code === 'hi') {
        seenCodes.add('hindi');
        seenNames.add('hindi');
      }
    }

    for (const l of customLanguagesList) {
      const codeLower = l.code.toLowerCase().trim();
      const nameLower = l.name.toLowerCase().trim();
      
      if (!seenCodes.has(codeLower) && !seenNames.has(nameLower)) {
        seenCodes.add(codeLower);
        seenNames.add(nameLower);
        uniques.push(l);
      }
    }

    return uniques;
  })();

  const getTranslation = (langCode: string): TranslationSet => {
    const base = translations['en'];
    const custom = customTranslations[langCode] || translations[langCode as any];
    if (!custom) return base;
    return {
      ...base,
      ...custom
    };
  };

  const handleCreateCustomLanguage = async (langName: string) => {
    if (!langName || langName.trim() === '') return;
    setIsTranslating(true);
    setTranslationError(null);

    const formattedCode = langName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
      const response = await fetch('/api/translate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: langName,
          englishProfile: translations.en
        })
      });

      const data = await response.json();
      if (!response.ok || data.status === 'error' || !data.translated) {
        throw new Error(data.error || "Failed to translate UI");
      }

      // Save custom translation
      const updatedTranslations = {
        ...customTranslations,
        [formattedCode]: data.translated
      };
      setCustomTranslations(updatedTranslations);
      localStorage.setItem('saathi_custom_translations', JSON.stringify(updatedTranslations));

      // Append code to languages list if it does not exist
      if (!customLanguagesList.some(cl => cl.code === formattedCode)) {
        const updatedList = [...customLanguagesList, { code: formattedCode, name: langName }];
        setCustomLanguagesList(updatedList);
        localStorage.setItem('saathi_custom_languages_list', JSON.stringify(updatedList));
      }

      setLanguage(formattedCode);
      setIsOpenCustomLangModal(false);
      setTypedCustomLang('');
      triggerToast(`Successfully translated entirely to ${langName}!`);
    } catch (e: any) {
      console.error(e);
      setTranslationError(e.message || "Failed to call translate API. Check if GEMINI_API_KEY is configured.");
    } finally {
      setIsTranslating(false);
    }
  };

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('saathi_onboarded') === 'true';
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('saathi_shops');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeShopId, setActiveShopId] = useState<string>(() => {
    const saved = localStorage.getItem('saathi_active_shop_id');
    return saved || '';
  });

  const [products, setProducts] = useState<Record<string, Product[]>>(() => {
    const saved = localStorage.getItem('saathi_products');
    return saved ? JSON.parse(saved) : {};
  });

  const [udhaars, setUdhaars] = useState<Record<string, UdhaarRecord[]>>(() => {
    const saved = localStorage.getItem('saathi_udhaars');
    return saved ? JSON.parse(saved) : {};
  });

  const [salesHistory, setSalesHistory] = useState<Record<string, SalesRecord[]>>(() => {
    const saved = localStorage.getItem('saathi_sales');
    return saved ? JSON.parse(saved) : {};
  });

  // Active view tab: 'dashboard' | 'inventory' | 'khaata' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'khaata' | 'settings'>('dashboard');

  // Profitability Heatmap Visual states
  const [selectedHeatmapProductId, setSelectedHeatmapProductId] = useState<string | null>(null);
  const [heatmapCategoryFilter, setHeatmapCategoryFilter] = useState<string>('All');
  const [heatmapSortBy, setHeatmapSortBy] = useState<'marginPercent' | 'marginAbsolute' | 'potentialProfit' | 'name' | 'stock'>('marginPercent');

  // Keyboard Shortcuts Modal State
  const [isOpenShortcutsModal, setIsOpenShortcutsModal] = useState<boolean>(false);

  // Owner Profile Modal State
  const [isOpenOwnerProfileModal, setIsOpenOwnerProfileModal] = useState<boolean>(false);

  // Temporary profile edit form states
  const [profileOwnerName, setProfileOwnerName] = useState<string>('');
  const [profileShopName, setProfileShopName] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [profileLocation, setProfileLocation] = useState<string>('');
  const [profileType, setProfileType] = useState<'manual' | 'digital'>('manual');

  // Input control states
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [addShopModalOpen, setAddShopModalOpen] = useState(false);
  
  // WhatsApp Share Dialog State
  const [whatsappDialogData, setWhatsappDialogData] = useState<{
    open: boolean;
    customerName: string;
    phone: string;
    amount: number;
    customMessage: string;
    copied: boolean;
  } | null>(null);

  // File Upload Drop Box Stats
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileImportStats, setFileImportStats] = useState<string | null>(null);

  // Barcode search / scan simulation state
  const [barcodeScanInput, setBarcodeScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'found' | 'not_found';
    product?: Product;
    barcodeValue?: string;
  }>({ status: 'idle' });

  // Onboarding wizard input state
  const [onboardShopName, setOnboardShopName] = useState('');
  const [onboardOwnerName, setOnboardOwnerName] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardCity, setOnboardCity] = useState('');
  const [onboardType, setOnboardType] = useState<'manual' | 'digital'>('manual');

  // New Shop setup inputs
  const [newShopName, setNewShopName] = useState('');
  const [newShopOwner, setNewShopOwner] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopCity, setNewShopCity] = useState('');
  const [newShopType, setNewShopType] = useState<'manual' | 'digital'>('manual');

  // New billing cart
  const [billingCart, setBillingCart] = useState<{
    product: Product;
    quantity: number;
  }[]>([]);
  const [billingPayMode, setBillingPayMode] = useState<'cash' | 'upi'>('upi');
  const [newBillCustomerName, setNewBillCustomerName] = useState('');
  const [isBillUdhaar, setIsBillUdhaar] = useState(false);
  const [recentInvoice, setRecentInvoice] = useState<{
    billId: string;
    customerName: string;
    items: { product: Product; quantity: number }[];
    total: number;
    profit: number;
    paymentMode: 'cash' | 'upi';
    date: string;
  } | null>(null);

  // New manual single product entry inputs
  const [newProdName, setNewProdName] = useState('');
  const [newProdBuy, setNewProdBuy] = useState('');
  const [newProdSell, setNewProdSell] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('pcs');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdCategory, setNewProdCategory] = useState('Grocery');
  const [newProdBarcode, setNewProdBarcode] = useState('');

  // AI suggestions state
  const [aiTips, setAiTips] = useState<AITip[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [tipsProvider, setTipsProvider] = useState<string>('rule-engine');

  // Toast / alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeShop = shops.find(s => s.id === activeShopId) || shops[0];
  const t = getTranslation(language);

  useEffect(() => {
    if (activeShop) {
      setProfileOwnerName(activeShop.ownerName || '');
      setProfileShopName(activeShop.name || '');
      setProfilePhone(activeShop.phone || '');
      setProfileLocation(activeShop.location || '');
      setProfileType(activeShop.type || 'manual');
    }
  }, [activeShop, isOpenOwnerProfileModal]);

  const handleSaveProfile = () => {
    if (!profileOwnerName.trim() || !profileShopName.trim()) {
      triggerToast("Owner Name and Shop Name are required!");
      return;
    }
    setShops(prev => {
      const next = prev.map(s => {
        if (s.id === activeShopId) {
          return {
            ...s,
            name: profileShopName.trim(),
            ownerName: profileOwnerName.trim(),
            phone: profilePhone.trim() || '9876543210',
            location: profileLocation.trim() || 'India',
            type: profileType
          };
        }
        return s;
      });
      localStorage.setItem('saathi_shops', JSON.stringify(next));
      return next;
    });
    setIsOpenOwnerProfileModal(false);
    triggerToast("Business Profile / मालिक प्रोफ़ाइल updated successfully!");
  };

  const handleBackupData = () => {
    try {
      const backupObj = {
        app: "Dukaan Saathi",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        shops,
        products,
        udhaars,
        salesHistory,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("download", `dukaan_saathi_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      triggerToast("Full backup (shops, products, udhaar, sales) downloaded successfully! / बैकअप डाउनलोड हो गया।");
    } catch (err) {
      console.error(err);
      triggerToast("Error backing up store data.");
    }
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || (parsed.app !== "Dukaan Saathi" && !parsed.shops)) {
          triggerToast("Invalid backup file format! / अमान्य बैकअप फ़ाइल।");
          return;
        }

        if (parsed.shops) setShops(parsed.shops);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.udhaars) setUdhaars(parsed.udhaars);
        if (parsed.salesHistory) setSalesHistory(parsed.salesHistory);

        triggerToast("Restore successful! All shops, products, and udhaar records updated! / डेटा सफलतापूर्वक रीस्टोर हुआ!");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to parse the backup file. / फ़ाइल पढ़ने में विफल।");
      }
    };
    fileReader.readAsText(files[0]);
    event.target.value = '';
  };

  const handleLoadDemoData = () => {
    if (!activeShopId) {
      triggerToast("No active shop found to load demo data. Please register a shop first!");
      return;
    }

    setProducts(prev => ({
      ...prev,
      [activeShopId]: [
        { id: 'p-1', name: 'Amul Butter 500g', buyPrice: 210, sellPrice: 245, unit: 'pcs', stock: 45, soldQuantity: 14, barcode: '8901262010113', category: 'Dairy' },
        { id: 'p-2', name: 'Maggi Family Pack', buyPrice: 92, sellPrice: 95, unit: 'pack', stock: 120, soldQuantity: 32, barcode: '8901058002475', category: 'Noodles' },
        { id: 'p-3', name: 'Ariel Matic 1kg', buyPrice: 145, sellPrice: 170, unit: 'pcs', stock: 24, soldQuantity: 8, barcode: '4902430902267', category: 'Detergents' },
        { id: 'p-4', name: 'Fortune Oil 1L', buyPrice: 140, sellPrice: 155, unit: 'bottle', stock: 80, soldQuantity: 20, barcode: '8906007281412', category: 'Grocery' },
        { id: 'p-5', name: 'Parle-G Gold biscuits', buyPrice: 8, sellPrice: 10, unit: 'pcs', stock: 200, soldQuantity: 55, barcode: '8901166113110', category: 'Snacks' },
        { id: 'p-6', name: 'Tata Salt 1kg', buyPrice: 24, sellPrice: 28, unit: 'pcs', stock: 150, soldQuantity: 12, barcode: '8901058002314', category: 'Spices' }
      ]
    }));

    setUdhaars(prev => ({
      ...prev,
      [activeShopId]: [
        { id: 'u-1', customerName: 'Rajesh Kumar', phone: '9812345670', amount: 1240, date: '2026-06-01', bills: ['#201', '#212'], daysAgo: 10, status: 'pending', history: [] },
        { id: 'u-2', customerName: "Sunita Ma'am", phone: '9822334455', amount: 450, date: '2026-06-08', bills: ['#245'], daysAgo: 2, status: 'pending', history: [] },
        { id: 'u-3', customerName: 'Amit Sharma', phone: '9944556677', amount: 2100, date: '2026-06-05', bills: ['#219', '#228'], daysAgo: 5, status: 'pending', history: [] },
        { id: 'u-4', customerName: 'Vikas Dubey', phone: '7011223344', amount: 3200, date: '2026-05-25', bills: ['#180'], daysAgo: 16, status: 'pending', history: [] },
        { id: 'u-5', customerName: 'Deepak Patil', phone: '8877665544', amount: 840, date: '2026-06-09', bills: ['#251'], daysAgo: 1, status: 'pending', history: [] }
      ]
    }));

    setSalesHistory(prev => ({
      ...prev,
      [activeShopId]: [
        { id: 's-1', amount: 1240, date: 'Mon', profit: 240, paymentMode: 'cash', itemsCount: 3 },
        { id: 's-2', amount: 1650, date: 'Tue', profit: 320, paymentMode: 'upi', itemsCount: 4 },
        { id: 's-3', amount: 2840, date: 'Wed', profit: 540, paymentMode: 'upi', itemsCount: 7 },
        { id: 's-4', amount: 1450, date: 'Thu', profit: 280, paymentMode: 'cash', itemsCount: 3 },
        { id: 's-5', amount: 2100, date: 'Fri', profit: 420, paymentMode: 'upi', itemsCount: 9 },
        { id: 's-6', amount: 1950, date: 'Sat', profit: 380, paymentMode: 'cash', itemsCount: 5 },
        { id: 's-7', amount: 3290, date: 'Sun', profit: 660, paymentMode: 'upi', itemsCount: 11 }
      ]
    }));

    triggerToast("✨ Demo simulation data loaded for active shop. Try of all features! / डेमो डेटा लोड हो गया।");
  };

  const handleClearShopData = () => {
    if (!activeShopId) return;
    if (!window.confirm("Are you sure you want to delete all products, udhaar, and sales history for this shop? / क्या आप वाकई सारा डेटा मिटाना चाहते हैं?")) return;

    setProducts(prev => ({ ...prev, [activeShopId]: [] }));
    setUdhaars(prev => ({ ...prev, [activeShopId]: [] }));
    setSalesHistory(prev => ({ ...prev, [activeShopId]: [] }));

    triggerToast("🗑️ All data cleared. Shop is now completely empty! / सारा डेटा साफ हो गया।");
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('saathi_lang', language);
    localStorage.setItem('saathi_onboarded', isOnboarded ? 'true' : 'false');
    localStorage.setItem('saathi_shops', JSON.stringify(shops));
    localStorage.setItem('saathi_active_shop_id', activeShopId);
    localStorage.setItem('saathi_products', JSON.stringify(products));
    localStorage.setItem('saathi_udhaars', JSON.stringify(udhaars));
    localStorage.setItem('saathi_sales', JSON.stringify(salesHistory));
    localStorage.setItem('saathi_device_contacts', JSON.stringify(deviceContacts));
  }, [language, isOnboarded, shops, activeShopId, products, udhaars, salesHistory, deviceContacts]);

  // Dukaan Contacts Book remains available as search suggestions for billing but does not pollute the unpaid debtors ledger automatically with zero-amount accounts on load.

  // Global Keyboard Shortcuts Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Alt or Ctrl keys or Meta keys
      const hasModifier = e.ctrlKey || e.altKey || e.metaKey;
      if (!hasModifier) return;

      const key = e.key.toLowerCase();

      // Avoid capturing short keys when typing inside editable fields
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );

      // If user is focused on textbox, only permit keys if they utilize the Alt modifier to prevent clashing
      if (isInputFocused && !e.altKey) {
        return;
      }

      // 1. Toggle New Invoice Modal (Ctrl + N or Alt + N or Ctrl + Shift + N)
      if (key === 'n') {
        e.preventDefault();
        setBillingModalOpen(prev => !prev);
        setBarcodeModalOpen(false); // Close other dialogs
        triggerToast("Shortcut: Billing / invoice panel toggled");
      }

      if (key === '1' || key === 'h') {
        e.preventDefault();
        setActiveTab('dashboard');
        triggerToast("Shortcut: Focussed Dashboard Tab");
      }
      if (key === '2' || key === 'i') {
        e.preventDefault();
        setActiveTab('inventory');
        triggerToast("Shortcut: Focussed Inventory Tab");
      }
      if (key === '3' || key === 'k') {
        e.preventDefault();
        setActiveTab('khaata');
        triggerToast("Shortcut: Focussed Khaata Book Tab");
      }
      if (key === '4' || key === 's') {
        e.preventDefault();
        setActiveTab('settings');
        triggerToast("Shortcut: Focussed Settings / Backups Tab");
      }
      // 5. Open Synced Contacts Phonebook (Ctrl+U or Alt+U or Alt+C)
      if (key === 'u' || key === 'c') {
        e.preventDefault();
        setIsOpenContactsModal(prev => !prev);
        triggerToast("Shortcut: Synced contacts phonebook toggled");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Onboarding/Fresh State AI Tips mapping
  const getOnboardingTips = (lang: LanguageCode): AITip[] => {
    const onboardingGuides: Record<LanguageCode, AITip[]> = {
      en: [
        { id: 'ob-1', text: "Welcome! Tap the 'Inventory' tab to add your shop products and set up prices.", type: 'onboarding' },
        { id: 'ob-2', text: "Automate sales: Click the 'Quick Bill' button to quickly record a sale and see live charts.", type: 'onboarding' },
        { id: 'ob-3', text: "Ledger Accounts: Open 'Khaata Diary' to import your customer or supplier contact lists.", type: 'onboarding' }
      ],
      hi: [
        { id: 'ob-1', text: "स्वागत है! अपने दुकान के प्रॉडक्ट्स जोड़ने और कीमतें सेट करने के लिए 'इन्वेंटरी' टैब पर जाएं।", type: 'onboarding' },
        { id: 'ob-2', text: "बिक्री दर्ज करें: बिक्री तुरंत रिकॉर्ड करने और लाइव चार्ट देखने के लिए 'बिल बनाएं' बटन पर क्लिक करें।", type: 'onboarding' },
        { id: 'ob-3', text: "खाता बुक: ग्राहकों या सप्लायर्स की सूची इम्पोर्ट करने के लिए 'खाता डायरी' खोलें।", type: 'onboarding' }
      ],
      mr: [
        { id: 'ob-1', text: "स्वागत आहे! आपल्या दुकानातील प्रॉдक्ट्स आणि त्यांच्या किमती व्यवस्थापित करण्यासाठी 'इन्वेंटरी' टॅबवर जा.", type: 'onboarding' },
        { id: 'ob-2', text: "बिलांची नोंद घ्या: विक्री सहजपणे नोंदवण्यासाठी आणि आलेख पाहण्यासाठी 'बिल बनवा' बटणावर क्लिक करा.", type: 'onboarding' },
        { id: 'ob-3', text: "खाते वही: संपर्क यादी लोड करण्यासाठी आणि उधारी व्यवस्थापित करण्यासाठी 'खाता डायरी' उघडा.", type: 'onboarding' }
      ],
      ta: [
        { id: 'ob-1', text: "வரவேற்கிறோம்! உங்கள் தயாரிப்புகள் மற்றும் விலைகளைச் சேர்க்க 'Inventory' பிரிவுக்குச் செல்லவும்.", type: 'onboarding' },
        { id: 'ob-2', text: "விற்பனை பதிவு: உடனுக்குடன் பில்களை உருவாக்க மற்றும் வரைபடத்தைக் காண 'New Billing' கிளிக் செய்க.", type: 'onboarding' },
        { id: 'ob-3', text: "வரவு செலவு கணக்கு: வாடிக்கையாளர் தொடர்புகளையும் இறக்குமதி செய்ய 'Khaata Diary' திறக்கவும்.", type: 'onboarding' }
      ],
      te: [
        { id: 'ob-1', text: "స్వాగతం! మీ ఉత్పత్తులు మరియు ధరలను జోడించడానికి 'ఇన్వెంటరీ' ట్యాబ్ క్లిక్ చేయండి.", type: 'onboarding' },
        { id: 'ob-2', text: "సేల్స్ నమోదు: త్వరగా బిల్లులు చేయడానికి మరియు చార్ట్‌లు చూడటానికి 'కొత్త బిల్లింగ్' క్లిక్ చేయండి.", type: 'onboarding' },
        { id: 'ob-3', text: "ఖాతా డైరీ: కస్టమర్ల జాబితాను లేదా చెల్లింపులను ట్రాక్ చేయడానికి 'ఖాతా డైరీ' తెరవండి.", type: 'onboarding' }
      ]
    };
    return onboardingGuides[lang] || onboardingGuides['en'];
  };

  const fetchAITips = async () => {
    setLoadingAi(true);
    try {
      const currentProducts = products[activeShopId] || [];
      const currentSales = salesHistory[activeShopId] || [];
      const currentUdhaars = udhaars[activeShopId] || [];

      const totalSalesAmt = currentSales.reduce((acc, s) => acc + s.amount, 0);
      const totalProfitAmt = currentSales.reduce((acc, s) => acc + s.profit, 0);
      const totalUdhaarAmt = currentUdhaars.reduce((acc, u) => u.status === 'pending' ? acc + u.amount : acc, 0);
      const shopObj = shops.find(s => s.id === activeShopId);
      const shopName = shopObj ? shopObj.name : "My Shop";

      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language: language,
          products: currentProducts,
          totalSales: totalSalesAmt,
          netProfit: totalProfitAmt,
          totalUdhaar: totalUdhaarAmt,
          activeShopName: shopName
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      if (data.success && data.tips) {
        const mappedTips: AITip[] = data.tips.map((tip: any, index: number) => ({
          id: `ai-tip-${index}-${Date.now()}`,
          text: tip.text,
          type: tip.type || 'info',
          isAIPerformed: data.provider === "gemini"
        }));
        setAiTips(mappedTips);
        setTipsProvider(data.provider || 'gemini');
      } else {
        throw new Error("Invalid response schema");
      }
    } catch (e) {
      console.error(e);
      // Fallback with translated tips if server offline or api error'd
      const defaultLocaleTips: Record<LanguageCode, AITip[]> = {
        en: [
          { id: '1', text: "Check your stock metrics regularly. Keeping proper margins is essential for stable profits.", type: 'info' },
          { id: '2', text: "Customer credits must be collected on time. Use Khaata Diary for easy WhatsApp reminders.", type: 'alert' },
          { id: '3', text: "Record bills regularly so your monthly profit analytics charts reflect accurate metrics.", type: 'info' }
        ],
        hi: [
          { id: '1', text: "सटीक मार्जिन और स्थिर बिक्री के लिए अपने स्टॉक की नियमित जांच करें।", type: 'info' },
          { id: '2', text: "समय रहते ग्राहक उधारी का कलेक्शन करें। तुरंत भुगतान पाने के लिए खाता डायरी का उपयोग करें।", type: 'alert' },
          { id: '3', text: "सटीक विश्लेषणात्मक आलेख देखने के लिए अपने दैनिक इन्वॉइस और बिल नियमित रूप से दर्ज करें।", type: 'info' }
        ],
        mr: [
          { id: '1', text: "आपल्या स्टॉकच्या पातळीची नियमितपणे तपासणी करा. ग्राहकांना आकर्षित करण्यासाठी किंमती नियंत्रित ठेवा.", type: 'info' },
          { id: '2', text: "योग्य वेळी वसुली मिळवण्यासाठी खाता डायरीमधील व्हॉट्सॲप रिमांडर सविस्तर वापरा.", type: 'alert' },
          { id: '3', text: "नफा आलेखावर अचूक आकडेवारी मिळवण्यासाठी रोजच्या बिलांच्या नोंदी त्वरित पूर्ण ठेवा.", type: 'info' }
        ],
        ta: [
          { id: '1', text: "மேகியின் லாப வரம்பு மிகக் குறைவாக (3.1%) உள்ளது. லாபத்தைப் பாதுகாக்க விலையை ₹95 இல் இருந்து ₹98 ஆக உயர்த்தவும்.", type: 'maggi-margin' },
          { id: '2', text: "வெள்ளிக்கிழமை அமூல் பட்டர் உங்கள் கடையில் அதிகமாக விற்கிறது. கூடுதல் ஸ்டாக் இருப்பு வையுங்கள்.", type: 'friday-butter' },
          { id: '3', text: "மொத்த கடன் அளவு பாதுகாப்பு வரம்பை தாண்டிவிட்டது. உடனே வாட்ஸ்அப் மூலம் நினைவூட்டுங்கள்.", type: 'udhaar-alert' }
        ],
        te: [
          { id: '1', text: "మ్యాగీపై లాభ మార్జిన్ చాలా తక్కువగా (3.1%) ఉంది. లాభాలు కాపాడుకోవడానికి అమ్మకపు ధరను ₹95 నుండి ₹98 చేయండి.", type: 'maggi-margin' },
          { id: '2', text: "శుక్రవారం అమూల్ బటర్ బాగా అమ్ముడవుతుంది. వ్యాపార నష్టం రాకుండా స్టాక్ సిద్ధం చేసుకోండి.", type: 'friday-butter' },
          { id: '3', text: "అప్పు బకాయిలు పరిధిని మించాయి. తక్షణం వాట్సాప్ రిమైండర్లు పంపి వసూలు చేసుకోండి.", type: 'udhaar-alert' }
        ]
      };
      setAiTips(defaultLocaleTips[language] || defaultLocaleTips['en']);
      setTipsProvider('rule-engine-local');
    } finally {
      setLoadingAi(false);
    }
  };

  const activeProductsCount = (products[activeShopId] || []).length;
  const activeSalesCount = (salesHistory[activeShopId] || []).length;
  const activeUdhaarsCount = (udhaars[activeShopId] || []).length;

  useEffect(() => {
    if (isOnboarded) {
      fetchAITips();
    }
  }, [language, activeShopId, isOnboarded, activeProductsCount, activeSalesCount, activeUdhaarsCount]);

  // Onboarding Submit
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardShopName.trim() || !onboardOwnerName.trim()) {
      alert("Please fill shop credentials");
      return;
    }
    const newShopId = 'shop-' + Date.now();
    const createdShop: Shop = {
      id: newShopId,
      name: onboardShopName,
      ownerName: onboardOwnerName,
      phone: onboardPhone || '9876543210',
      location: onboardCity || 'India',
      type: onboardType
    };

    setShops([createdShop]);
    setActiveShopId(newShopId);
    
    // Initialize empty collections for the new shop so they start with clean slate
    setProducts(prev => ({
      ...prev,
      [newShopId]: []
    }));
    setUdhaars(prev => ({
      ...prev,
      [newShopId]: []
    }));
    setSalesHistory(prev => ({
      ...prev,
      [newShopId]: []
    }));

    setIsOnboarded(true);
    triggerToast(`Welcome to Dukaan Saathi! Registered: ${onboardShopName}`);
  };

  // Add Custom Shop
  const handleAddShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newShopOwner.trim()) return;
    
    const shopId = 'shop-' + Date.now();
    const created: Shop = {
      id: shopId,
      name: newShopName,
      ownerName: newShopOwner,
      phone: newShopPhone || '9876543210',
      location: newShopCity || 'India',
      type: newShopType
    };

    setShops(prev => [...prev, created]);
    setActiveShopId(shopId);

    // Seed empty arrays
    setProducts(prev => ({ ...prev, [shopId]: [] }));
    setUdhaars(prev => ({ ...prev, [shopId]: [] }));
    setSalesHistory(prev => ({ ...prev, [shopId]: [] }));

    setAddShopModalOpen(false);
    // Reset fields
    setNewShopName('');
    setNewShopOwner('');
    setNewShopPhone('');
    setNewShopCity('');
    
    triggerToast(`Created new clean shop: ${newShopName}`);
  };

  // Manual single product add
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProd: Product = {
      id: 'p-' + Date.now(),
      name: newProdName,
      buyPrice: parseFloat(newProdBuy) || 0,
      sellPrice: parseFloat(newProdSell) || 0,
      unit: newProdUnit,
      stock: parseInt(newProdStock) || 0,
      soldQuantity: 0,
      barcode: newProdBarcode || undefined,
      category: newProdCategory
    };

    setProducts(prev => {
      const currentList = prev[activeShopId] || [];
      return {
        ...prev,
        [activeShopId]: [newProd, ...currentList]
      };
    });

    setAddProductModalOpen(false);
    // Reset
    setNewProdName('');
    setNewProdBuy('');
    setNewProdSell('');
    setNewProdBarcode('');
    setNewProdUnit('pcs');

    triggerToast(`Product '${newProdName}' added successfully to inventory!`);
  };

  // Simulate file drag and drop parsing
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      parseMockFile(file.name);
    }
  };

  const parseMockFile = (fileName: string) => {
    setUploadedFileName(fileName);
    // Simulate smart spreadsheet upload of Tally / Excel / CSV
    const simulatedAddedProducts: Product[] = [
      { id: 'p-xl-1', name: 'Tata Tea Premium 500g', buyPrice: 160, sellPrice: 190, unit: 'pack', stock: 150, soldQuantity: 34, barcode: '8901058002215', category: 'Tea' },
      { id: 'p-xl-2', name: 'Fortune Soya Chunks 200g', buyPrice: 38, sellPrice: 45, unit: 'pcs', stock: 120, soldQuantity: 18, barcode: '8906007283317', category: 'Grocery' },
      { id: 'p-xl-3', name: 'Surf Excel Easy Wash 1kg', buyPrice: 110, sellPrice: 130, unit: 'pcs', stock: 60, soldQuantity: 12, barcode: '8901030753449', category: 'Detergents' }
    ];

    setProducts(prev => {
      const current = prev[activeShopId] || [];
      // Combine and filter out duplicate products based on name
      const names = new Set(current.map(p => p.name));
      const filteredSimulated = simulatedAddedProducts.filter(p => !names.has(p.name));
      return {
        ...prev,
        [activeShopId]: [...filteredSimulated, ...current]
      };
    });

    setFileImportStats("Success: Parsed 3 new products with cost and margins imported into P&L.");
    triggerToast(`Parsed '${fileName}' successfully! Imported 3 products.`);
  };

  // Perform Simulated Barcode Scan
  const simulateBarcodeScan = () => {
    const code = barcodeScanInput.trim();
    if (!code) {
      triggerToast("Please input a barcode code or item name to scan.");
      return;
    }

    const currentShopProds = products[activeShopId] || [];
    // Match based on barcode string or name match
    const match = currentShopProds.find(
      p => p.barcode === code || p.name.toLowerCase().includes(code.toLowerCase())
    );

    if (match) {
      setScanResult({
        status: 'found',
        product: match,
        barcodeValue: code
      });
      // Auto toggle to quick adding in Cartesian cart
      addToBillingCart(match);
    } else {
      setScanResult({
        status: 'not_found',
        barcodeValue: code
      });
    }
  };

  // Quick setup new item scanned via barcode
  const handleQuickAddScannedItem = () => {
    if (!scanResult.barcodeValue) return;
    const guessName = scanResult.barcodeValue.match(/^\d+$/) 
      ? `Barcode Item ${scanResult.barcodeValue.slice(-4)}` 
      : scanResult.barcodeValue;

    const quickProd: Product = {
      id: 'p-quick-' + Date.now(),
      name: guessName,
      buyPrice: 85, // estimate
      sellPrice: 100, // margin 15%
      unit: 'pcs',
      stock: 50,
      soldQuantity: 1,
      barcode: scanResult.barcodeValue,
      category: 'General'
    };

    setProducts(prev => ({
      ...prev,
      [activeShopId]: [quickProd, ...(prev[activeShopId] || [])]
    }));

    addToBillingCart(quickProd);
    setScanResult({
      status: 'found',
      product: quickProd,
      barcodeValue: scanResult.barcodeValue
    });
    triggerToast(`Added & checked out: ${quickProd.name}`);
  };

  // Interactive Billing System
  const addToBillingCart = (product: Product) => {
    setBillingCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerToast(`Added ${product.name} to bill`);
  };

  const updateCartQty = (prodId: string, delta: number) => {
    setBillingCart(prev => prev.map(item => {
      if (item.product.id === prodId) {
        const nQty = item.quantity + delta;
        return { ...item, quantity: nQty < 1 ? 1 : nQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (prodId: string) => {
    setBillingCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  // Submit Bill
  const handleCheckoutBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (billingCart.length === 0) {
      alert("Billing cart is empty.");
      return;
    }

    const billTotal = billingCart.reduce((sum, item) => sum + (item.product.sellPrice * item.quantity), 0);
    const billProfit = billingCart.reduce((sum, item) => sum + ((item.product.sellPrice - item.product.buyPrice) * item.quantity), 0);
    const itemsCount = billingCart.reduce((sum, item) => sum + item.quantity, 0);

    // Save sales metrics
    const newSale: SalesRecord = {
      id: 's-now-' + Date.now(),
      amount: billTotal,
      date: 'Wed', // Map to today
      profit: billProfit,
      paymentMode: billingPayMode,
      itemsCount: itemsCount
    };

    // Deduct inventory quantities and aggregate soldQuantity stats
    setProducts(prev => {
      const activeList = prev[activeShopId] || [];
      const updated = activeList.map(item => {
        const cartMatch = billingCart.find(c => c.product.id === item.id);
        if (cartMatch) {
          return {
            ...item,
            stock: Math.max(0, item.stock - cartMatch.quantity),
            soldQuantity: item.soldQuantity + cartMatch.quantity
          };
        }
        return item;
      });
      return { ...prev, [activeShopId]: updated };
    });

    // Handle Udhaar creation
    if (isBillUdhaar && newBillCustomerName.trim()) {
      const trimmedName = newBillCustomerName.trim();
      const matchedContact = deviceContacts.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
      const contactPhone = matchedContact ? matchedContact.phone : ('91' + (Math.floor(Math.random() * 900000000) + 9000000000));

      const newDbt: UdhaarRecord = {
        id: 'u-gen-' + Date.now(),
        customerName: trimmedName,
        phone: contactPhone,
        amount: billTotal,
        date: new Date().toISOString().split('T')[0],
        bills: [`#${Math.floor(Math.random() * 900) + 100}`],
        daysAgo: 0,
        status: 'pending',
        history: []
      };

      setUdhaars(prev => ({
        ...prev,
        [activeShopId]: [newDbt, ...(prev[activeShopId] || [])]
      }));
    }

    // append new sale event
    setSalesHistory(prev => ({
      ...prev,
      [activeShopId]: [...(prev[activeShopId] || []), newSale]
    }));

    // Reset checkout states
    const generatedBillId = 'DS-' + (Math.floor(Math.random() * 90000) + 10000);
    setRecentInvoice({
      billId: generatedBillId,
      customerName: isBillUdhaar && newBillCustomerName.trim() ? newBillCustomerName.trim() : 'Walk-in Customer (ग्राहक)',
      items: [...billingCart],
      total: billTotal,
      profit: billProfit,
      paymentMode: billingPayMode,
      date: new Date().toLocaleDateString()
    });

    setBillingCart([]);
    setIsBillUdhaar(false);
    setNewBillCustomerName('');
    setBillingModalOpen(false);
    setBarcodeModalOpen(false);

    triggerToast(`Bill of ₹${billTotal} created successfully (${billingPayMode === 'upi' ? 'UPI' : 'Cash'})!`);
  };

  // WhatsApp reminder logic
  const handleOpenWhatsAppDialog = (debtor: UdhaarRecord) => {
    const customText = t.whatsappReminderText
      .replace('{shopName}', activeShop.name)
      .replace('{amount}', debtor.amount.toString())
      .replace('{phone}', activeShop.phone);

    setWhatsappDialogData({
      open: true,
      customerName: debtor.customerName,
      phone: debtor.phone,
      amount: debtor.amount,
      customMessage: customText,
      copied: false
    });
  };

  const triggerMockWhatsAppSend = () => {
    if (!whatsappDialogData) return;
    const encodedText = encodeURIComponent(whatsappDialogData.customMessage);
    const targetUrl = `https://api.whatsapp.com/send?phone=${whatsappDialogData.phone}&text=${encodedText}`;
    
    // Simulate copy message & open link
    setWhatsappDialogData(prev => prev ? { ...prev, copied: true } : null);
    triggerToast(`Copied! Simulating sending WhatsApp reminder to ${whatsappDialogData.customerName}...`);
    
    // Open in a safe iframe-compatible separate link
    setTimeout(() => {
      window.open(targetUrl, '_blank');
      setWhatsappDialogData(null);
    }, 1500);
  };

  // Settle debtor completely
  const settleDebtorAccount = (debtorId: string) => {
    setUdhaars(prev => {
      const list = prev[activeShopId] || [];
      return {
        ...prev,
        [activeShopId]: list.map(item => 
          item.id === debtorId ? { ...item, status: 'settled' as const, amount: 0 } : item
        )
      };
    });
    triggerToast("Outstanding bill settled successfully.");
  };

  // Contacts book helper functions
  const handleAddNewContactDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      triggerToast("Please enter a valid Name and Phone Number");
      return;
    }
    const cleanPhone = newContactPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      triggerToast("Please enter a valid 10-digit phone number");
      return;
    }
    
    const newContactObj = {
      id: 'c-user-' + Date.now(),
      name: newContactName.trim(),
      phone: cleanPhone,
      origin: newContactOrigin,
      importCount: 0
    };

    setDeviceContacts(prev => [newContactObj, ...prev]);
    setNewContactName('');
    setNewContactPhone('');
    triggerToast(`Added "${newContactObj.name}" to your Simulated ${newContactOrigin} contacts!`);
  };

  const handleSyncContactsFromPhone = () => {
    setIsSyncingContacts(true);
    triggerToast("Initiating digital contact synchronization from your phone...");
    
    setTimeout(() => {
      const extraBuddies = [
        { id: 'c-extra-1', name: 'Ramesh Chaurasiya (Pan Bhandar)', phone: '9455123456', origin: 'WhatsApp', importCount: 0 },
        { id: 'c-extra-2', name: 'Kiran Tai (Tiffin Service)', phone: '7822994411', origin: 'Google Contacts', importCount: 0 },
        { id: 'c-extra-3', name: 'Vikram Singh (Naya Builder)', phone: '8103344556', origin: 'WhatsApp', importCount: 0 }
      ];
      
      setDeviceContacts(prev => {
        const existingPhones = new Set(prev.map(c => c.phone));
        const filteredNew = extraBuddies.filter(b => !existingPhones.has(b.phone));
        return [...prev, ...filteredNew];
      });
      setIsSyncingContacts(false);
      triggerToast("Contacts book synced successfully! Added 3 new clients.");
    }, 2000);
  };

  const handleImportContactToKhaata = (contact: { id: string; name: string; phone: string; origin: string }) => {
    const currentUdhaarList = udhaars[activeShopId] || [];
    const alreadyExists = currentUdhaarList.some(u => u.phone === contact.phone && u.status === 'pending');
    
    if (alreadyExists) {
      triggerToast(`Account for "${contact.name}" already has pending balance in this shop.`);
      return;
    }

    const newDbt: UdhaarRecord = {
      id: 'u-import-' + Date.now() + Math.floor(Math.random() * 1000),
      customerName: contact.name,
      phone: contact.phone,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      bills: ['None (Imported Contact)'],
      daysAgo: 0,
      status: 'pending',
      history: []
    };

    setUdhaars(prev => ({
      ...prev,
      [activeShopId]: [newDbt, ...(prev[activeShopId] || [])]
    }));

    setDeviceContacts(prev => prev.map(c => c.id === contact.id ? { ...c, importCount: c.importCount + 1 } : c));
    triggerToast(`"${contact.name}" successfully linked to Khaata book!`);
  };

  // SIMULATE PDF REPORT
  const handleDownloadPdf = () => {
    triggerToast(t.downloadSuccess);
    
    // Construct text representation of current shop statistics for direct local download
    const activeProds = products[activeShopId] || [];
    const activeUdhaars = udhaars[activeShopId] || [];
    const sales = salesHistory[activeShopId] || [];
    const totalSalesNum = sales.reduce((sum, item) => sum + item.amount, 0);

    const reportContent = `
     =========================================
          DUKAAN SAATHI BUSINESS REPORT
     =========================================
     Shop Name: ${activeShop.name}
     Owner: ${activeShop.ownerName}
     Date: ${new Date().toLocaleDateString()}
     
     FINANCIAL SUMMARY:
     - Accumulated sales: ₹${totalSalesNum.toLocaleString()}
     - Outstandings (Khaata Udhaar): ₹${activeUdhaars.reduce((sum, s) => sum + (s.status === 'pending' ? s.amount : 0), 0)}
     
     PRODUCT STATS IN INVENTORY (${activeProds.length} items):
     ${activeProds.map(p => `- ${p.name}: Buy: ₹${p.buyPrice}, Sell: ₹${p.sellPrice}, Units Sold: ${p.soldQuantity}`).join('\r\n')}
     
     PENDING DEBTORS KHAATA:
     ${activeUdhaars.filter(u => u.status === 'pending').map(u => `- ${u.customerName} (Phone: ${u.phone}): Pending ₹${u.amount}`).join('\r\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeShop.name.toLowerCase().replace(/\s+/g, '_')}_monthly_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculated properties from active shop metrics
  const activeProds = products[activeShopId] || [];
  const activeUdhaars = udhaars[activeShopId] || [];
  const activeSales = salesHistory[activeShopId] || [];

  // Today sales indicator
  const todayTotalSalesSum = activeSales.reduce((sum, record) => sum + record.amount, 0);
  const todayTotalProfitSum = activeSales.reduce((sum, record) => sum + record.profit, 0);
  const activeOutstandingUdhaarSum = activeUdhaars
    .filter(u => u.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);

  const profitMarginPercent = todayTotalSalesSum > 0 
    ? Math.round((todayTotalProfitSum / todayTotalSalesSum) * 100) 
    : 0;

  // Render Language Onboarding if not setup
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex flex-col justify-center items-center py-10 px-4">
        <form onSubmit={handleOnboardingSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Sparkles className="w-9 h-9 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Dukaan Saathi</h1>
            <p className="text-sm text-indigo-600 font-semibold uppercase mt-1 tracking-wider">Your Local Shop business Advisor</p>
          </div>

          {/* Language selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-black text-slate-600 block uppercase tracking-wide mb-2 flex items-center gap-1">
              <Languages className="w-4 h-4 text-indigo-600" />
              Select Your Preferred Language / अपनी भाषा चुनें
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold text-center border transition-all ${
                    language === l.code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {l.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsOpenCustomLangModal(true)}
                className="py-2 px-3 rounded-lg text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-300 text-center transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 animate-pulse" />
                Any Language
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-1 mb-2 uppercase">{t.shopSetup}</h3>
            
            <div>
              <label className="text-xs font-bold text-slate-500 block uppercase mb-1">{t.shopNameLabel}</label>
              <input 
                type="text" 
                required
                value={onboardShopName}
                onChange={e => setOnboardShopName(e.target.value)}
                placeholder="e.g. Laxmi General Store"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm font-semibold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block uppercase mb-1">{t.ownerNameLabel}</label>
                <input 
                  type="text" 
                  required
                  value={onboardOwnerName}
                  onChange={e => setOnboardOwnerName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm font-semibold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block uppercase mb-1">{t.locationLabel}</label>
                <input 
                  type="text" 
                  value={onboardCity}
                  onChange={e => setOnboardCity(e.target.value)}
                  placeholder="City"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm font-semibold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block uppercase mb-1">{t.phoneLabel}</label>
              <input 
                type="tel" 
                value={onboardPhone}
                onChange={e => setOnboardPhone(e.target.value)}
                placeholder="Mobile number for WhatsApp Reminders"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-sm font-semibold outline-none"
              />
            </div>

            {/* Shop Mode selector */}
            <div className="space-y-2 mt-2">
              <label className="text-xs font-bold text-slate-500 block uppercase">Select Your Working Style</label>
              <div className="flex flex-col gap-2">
                <label className={`border rounded-xl p-3 flex gap-3 cursor-pointer transition-all ${
                  onboardType === 'manual' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name="shopType" 
                    checked={onboardType === 'manual'}
                    onChange={() => setOnboardType('manual')}
                    className="mt-1" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">{t.shopTypeManual}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{t.shopTypeManualDesc}</p>
                  </div>
                </label>

                <label className={`border rounded-xl p-3 flex gap-3 cursor-pointer transition-all ${
                  onboardType === 'digital' ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    name="shopType" 
                    checked={onboardType === 'digital'}
                    onChange={() => setOnboardType('digital')}
                    className="mt-1" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">{t.shopTypeDigital}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{t.shopTypeDigitalDesc}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all mt-2 active:scale-95 text-sm"
          >
            {t.startBtn}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 select-none pb-20 sm:pb-0">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-slate-100 text-xs font-bold px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <nav id="navbar" className="min-h-[3.5rem] py-2 sm:py-0 bg-white border-b border-slate-200 px-4 sm:px-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0 shadow-sm text-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-initial">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-indigo-900 truncate">{t.appName}</h1>
              <span className="text-[9px] bg-indigo-50 text-indigo-600 font-black px-1.5 rounded-full border border-indigo-100">SAATHI</span>
            </div>
            
            {/* Multi shop switcher dropdown badge border container */}
            <div className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg px-2 py-0.5 mt-0.5 transition-all max-w-[170px] sm:max-w-[230px] md:max-w-[320px] shadow-xs">
              <select 
                value={activeShopId}
                onChange={e => {
                  setActiveShopId(e.target.value);
                  triggerToast(`Switched shop!`);
                }}
                className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-wider bg-transparent border-none p-0 pr-4 outline-none cursor-pointer focus:ring-0 w-full truncate text-ellipsis whitespace-nowrap block"
              >
                {shops.map(sh => (
                  <option key={sh.id} value={sh.id}>{sh.name} • {sh.location}</option>
                ))}
              </select>
              <button 
                onClick={() => setAddShopModalOpen(true)}
                className="p-0.5 hover:bg-indigo-50 rounded text-indigo-600 shrink-0 cursor-pointer" 
                title={t.addShop}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          
          {/* Quick inline language chooser switcher */}
          <div className="flex flex-row items-center bg-slate-100 p-1 rounded-md text-[10px] font-bold border border-slate-200 gap-1 overflow-x-auto max-w-[190px] xs:max-w-[260px] sm:max-w-xs md:max-w-none scrollbar-thin whitespace-nowrap shrink-0">
            {allLanguages.map((l) => (
              <button 
                key={l.code}
                onClick={() => { 
                  setLanguage(l.code); 
                  triggerToast(`Language set to ${l.name}`); 
                }}
                className={`px-1.5 py-0.5 rounded transition-all uppercase tracking-tighter shrink-0 cursor-pointer ${language === l.code ? 'bg-white shadow-xs text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {l.code.length <= 3 ? l.name : l.name.substring(0, 4) + '..'}
              </button>
            ))}
            <button
              onClick={() => setIsOpenCustomLangModal(true)}
              className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-dashed border-indigo-200 flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Translate App to Any Language / भाषा चुनें"
            >
              <Plus className="w-2.5 h-2.5 shrink-0" />
              <span>+ Language</span>
            </button>
          </div>

          {/* Quick trigger active indicator */}
          <div className="hidden md:flex items-center bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 text-[10px] text-emerald-700 font-bold gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
            Cloud Sync Ready
          </div>

          {/* Keyboard shortcuts trigger */}
          <button 
            type="button"
            onClick={() => setIsOpenShortcutsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 text-slate-750 text-xs font-extrabold rounded-xl border border-slate-250 transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Keyboard Shortcuts / कीबोर्ड शॉर्टकट्स (Alt + /)"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-slate-700">Shortcuts (शॉर्टकट्स)</span>
            <kbd className="hidden md:inline-block bg-white text-[9px] px-1.5 py-0.2 rounded border border-slate-300 font-mono shadow-xs text-slate-500 font-extrabold ml-0.5">Alt+/</kbd>
          </button>
          
          {/* User Profile display */}
          <button 
            type="button"
            onClick={() => setIsOpenOwnerProfileModal(true)}
            className="w-10 h-10 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all rounded-full border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-xs cursor-pointer shadow-xs shrink-0" 
            title={`View Owner Config Profile: ${activeShop.ownerName} / मालिक प्रोफ़ाइल`}
          >
            {activeShop.ownerName ? activeShop.ownerName.slice(0, 2).toUpperCase() : 'ME'}
          </button>
        </div>
      </nav>

      {/* Primary Dynamic Screen Layout */}
      {activeTab === 'dashboard' && (
        <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          
          {/* Left Area: Analytical KPIs & Trends */}
          <div className="flex-[1.8] flex flex-col gap-4 overflow-y-auto lg:overflow-visible">
            
            {/* Top KPI row of 4 visual columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
              
              {/* Today's Sales indicator card */}
              <div 
                id="kpi-today-sales"
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
                onClick={() => setBillingModalOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.todaySales}</p>
                  <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1">₹{todayTotalSalesSum.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {todayTotalSalesSum > 0 ? (
                    <span className="text-[9px] text-emerald-650 text-emerald-600 font-black bg-emerald-50 px-1.5 py-0.5 rounded">+100% initial growth</span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">No sales yet today</span>
                  )}
                </div>
              </div>

              {/* Profit Indicator Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.netProfit}</p>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{todayTotalProfitSum.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {t.margin}: <span className="font-bold text-slate-800">{profitMarginPercent}%</span>
                </p>
              </div>

              {/* Udhaar Debts KPI Indicator */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.totalUdhaar}</p>
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                </div>
                <p className="text-2xl font-black text-orange-600 mt-1">₹{activeOutstandingUdhaarSum.toLocaleString()}</p>
                <p className="text-[10px] text-orange-500 font-bold">
                  {activeUdhaars.filter(u => u.status === 'pending').length} {t.overdue} Payments
                </p>
              </div>

              {/* Pay Split visualizer */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.paymentMode}</p>
                <div className="flex items-end justify-between mt-2 gap-2">
                  <div className="flex-1 text-center bg-slate-50 p-1.5 rounded border border-slate-100">
                    <p className="text-[9px] font-black text-indigo-600 uppercase">UPI</p>
                    <p className="text-base font-black text-slate-850">
                      {activeSales.length > 0 ? Math.round((activeSales.filter(s => s.paymentMode === 'upi').length / activeSales.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="flex-1 text-center bg-slate-50 p-1.5 rounded border border-slate-100">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Cash</p>
                    <p className="text-base font-black text-slate-700">
                      {activeSales.length > 0 ? Math.round((activeSales.filter(s => s.paymentMode === 'cash').length / activeSales.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Mid Section: Weekly performance Chart representation */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-[220px]">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    {t.sevenDaysSales}
                  </h3>
                  <p className="text-[10px] text-slate-400">Weekly sales summary & raw profitability metrics</p>
                </div>
                <button 
                  onClick={handleDownloadPdf}
                  className="text-[10px] font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 transition-all"
                >
                  <Download className="w-3 h-3" />
                  {t.downloadPdf}
                </button>
              </div>

              {/* custom SVG high contrast bar chart widget */}
              {activeSales.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center bg-indigo-50/25 border border-dashed border-indigo-100 rounded-xl my-2">
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500 animate-pulse" />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-0.5">No Sales Logged Yet (कोई बिक्री नहीं है)</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mb-3 leading-normal">
                    Record customer sales using the Checkout Billing System or scan barcode items to automatically update business trends!
                  </p>
                  <button 
                    onClick={() => setBillingModalOpen(true)}
                    className="text-[9.5px] font-black uppercase tracking-wider bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>⚡ Quick Bill Counter (बिल बनाएं)</span>
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-end justify-between gap-2 px-1 pt-4 pb-2">
                  {activeSales.map((record) => {
                    const maxAmt = Math.max(...activeSales.map(s => s.amount), 1000);
                    const heightPercent = Math.min(100, Math.max(15, (record.amount / maxAmt) * 80));
                    const profitHeight = Math.min(heightPercent, (record.profit / maxAmt) * 80);
                    
                    return (
                      <div key={record.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] p-2 rounded shadow-xl hidden group-hover:block z-10 w-24 pointer-events-none text-center">
                          <p className="font-bold border-b border-slate-700 pb-0.5 mb-0.5">{record.date}'s report</p>
                          <p>Sales: ₹{record.amount}</p>
                          <p className="text-emerald-400">Profit: ₹{record.profit}</p>
                        </div>

                        {/* Bar columns stacks */}
                        <div className="w-full flex flex-col justify-end items-center h-28 gap-0.5">
                          <div 
                            style={{ height: `${heightPercent}%` }} 
                            className="w-4 md:w-8 bg-indigo-600 rounded-t-sm hover:bg-indigo-700 transition-all cursor-pointer relative"
                          >
                            {/* Inner Profit chunk indicator */}
                            <div 
                              style={{ height: `${Math.max(10, (record.profit / record.amount) * 100)}%` }} 
                              className="bg-emerald-400 absolute bottom-0 left-0 right-0 rounded-t-xs"
                            />
                          </div>
                        </div>

                        {/* Day Label */}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{record.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Chart legend mapping */}
              <div className="flex items-center gap-4 text-[10px] justify-center pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
                  <span className="text-slate-500 font-semibold">Total Revenue (बिक्री)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                  <span className="text-slate-500 font-semibold">Net Income (कच्चा मुनाफा)</span>
                </div>
                <div className="flex items-center bg-indigo-50/50 px-2 py-0.5 rounded text-[9px] text-indigo-700 font-bold border border-indigo-100/50">
                  ⚡ {t.bestSalesDay}
                </div>
              </div>

            </div>

            {/* Product wise margin analysis table */}
            <div className="h-[280px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{t.prodAnalysis}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAddProductModalOpen(true)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 px-3 py-1 rounded-lg shadow-sm transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    {t.addSingleProduct}
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="flex items-center gap-1 text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded shadow-sm hover:bg-slate-100"
                  >
                    <Upload className="w-3 h-3 text-slate-500" />
                    {t.addProductsExcel}
                  </button>
                </div>
              </div>

              {/* Product overview roster */}
              {activeProds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <Package className="w-5 h-5 text-indigo-505" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">Your Product Catalog is Empty</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mb-3.5 leading-normal font-medium font-sans">
                    This is a clean-slate shop created just for you! Add products under the "Inventory" tab or quickly seed the sandbox in Settings to populate this.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAddProductModalOpen(true)}
                      className="text-[10px] uppercase font-black tracking-wider bg-indigo-600 hover:bg-indigo-705 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                    >
                      + Add Item
                    </button>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="text-[10px] uppercase font-black tracking-wider bg-white border border-slate-350 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    >
                      ⚙️ Demo Sandbox
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-black tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2">{t.productName}</th>
                        <th className="px-4 py-2">{t.buyPrice}</th>
                        <th className="px-4 py-2">{t.sellPrice}</th>
                        <th className="px-4 py-2">{t.stock}</th>
                        <th className="px-4 py-2">{t.sold}</th>
                        <th className="px-4 py-2 text-right">Margin / profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeProds.map((prod) => {
                        const marginAmount = prod.sellPrice - prod.buyPrice;
                        const marginPercent = prod.sellPrice > 0 ? Math.round((marginAmount / prod.sellPrice) * 100) : 0;
                        const isLowMargin = marginPercent < 8;
                        const productProfit = marginAmount * prod.soldQuantity;

                        return (
                          <tr key={prod.id} className={`text-xs hover:bg-slate-50 transition-all ${isLowMargin ? 'bg-red-50/20' : ''}`}>
                            <td className="px-4 py-2.5 font-bold text-slate-800">
                              <span className="block">{prod.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono tracking-wider bg-slate-50 border border-slate-100 rounded px-1">{prod.barcode || 'N/A Barcode'}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 font-semibold">₹{prod.buyPrice}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-semibold">₹{prod.sellPrice}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-1.5 py-0.5 rounded-[3px] text-[9.5px] font-black ${prod.stock < 15 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'}`}>
                                {prod.stock} {prod.unit}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-bold text-slate-600">{prod.soldQuantity} units</td>
                            <td className="px-4 py-2 text-right">
                              <div className="font-extrabold text-emerald-600">
                                +₹{productProfit}
                              </div>
                              <span className={`inline-block text-[9px] font-black px-1.5 py-0.2 rounded-full mt-0.5 ${isLowMargin ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                {marginPercent}% {isLowMargin ? 'Low Margin' : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Area: AI Saathi recommendations & Recent Khaata */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* AI Advisor Panel */}
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-5 text-white flex flex-col gap-3 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                <Sparkles className="w-36 h-36" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner">
                  <span className="text-xl animate-bounce">🤖</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200 flex items-center gap-1">
                    {t.aiTipsTitle}
                  </p>
                  <h3 className="font-extrabold text-white text-lg tracking-tight leading-tight">{t.appName} Smart Tips</h3>
                </div>
              </div>

              {/* tip statements mapping */}
              <div className="space-y-3 my-2 flex-1">
                {loadingAi ? (
                  <div className="space-y-2 py-4">
                    <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    <p className="text-[10px] text-center text-indigo-200 mt-1">{t.generatingTips}</p>
                  </div>
                ) : activeProds.length === 0 ? (
                  <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 backdrop-blur-sm shadow-md flex flex-col gap-2 text-center py-5">
                    <span className="text-2.5xl animate-bounce">🤖</span>
                    <p className="text-xs leading-normal font-extrabold text-indigo-50 font-sans">
                      Welcome to your new Dukaan Saathi space! To receive live customized business advice, add your first inventory items or record customer bills.
                    </p>
                    <p className="text-[10px] text-indigo-200 font-bold leading-normal border-t border-white/10 pt-2 font-sans">
                      💡 Tip: You can load sample demo data in Settings to test how everything looks with real insights!
                    </p>
                  </div>
                ) : (
                  aiTips.map((tip, idx) => (
                    <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm shadow-md flex gap-2">
                      <span className="text-base select-none">
                        {tip.type === 'maggi-margin' || tip.type === 'margin' ? '📐' : 
                         tip.type === 'friday-butter' || tip.type === 'info' ? '💡' : '⚠️'}
                      </span>
                      <p className="text-xs leading-snug font-medium text-indigo-50">
                        {tip.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* refresh advisor btn */}
              <button 
                id="generate-tips-btn"
                disabled={loadingAi}
                onClick={fetchAITips}
                className="w-full bg-white text-indigo-700 hover:bg-indigo-50 transition-all font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                {t.generateNewTips}
              </button>
              
              <div className="text-[9px] text-center text-indigo-200 italic mt-1">
                Powered by {tipsProvider === 'gemini-3.5-flash' ? 'Google Gemini AI' : 'Dukaan rules engine'}
              </div>
            </div>

            {/* Recent Khaata Diary pending payments list */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-[250px]">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-5 bg-orange-500 rounded-sm"></span>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{t.recentUdhaar}</h3>
                </div>
                <button 
                  onClick={() => setActiveTab('khaata')}
                  className="text-[10px] text-indigo-600 font-black cursor-pointer hover:underline"
                >
                  {t.viewAll} →
                </button>
              </div>

              {/* debtors profiles */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {activeUdhaars.filter(u => u.status === 'pending').length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl h-full select-none">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-1.5 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">No Pending Debts / कोई उधारी नहीं है</p>
                    <p className="text-[9.5px] leading-normal text-slate-400 font-sans mt-1">
                      Your ledger is perfectly balanced. All customer accounts are fully settled!
                    </p>
                  </div>
                ) : (
                  activeUdhaars.filter(u => u.status === 'pending').slice(0, 4).map((debtor) => (
                    <div key={debtor.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-slate-250 text-slate-700 font-extrabold rounded-full flex items-center justify-center text-xs border border-slate-200">
                          {debtor.customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{debtor.customerName}</p>
                          <p className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {debtor.phone} • {debtor.daysAgo}d ago
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">₹{debtor.amount}</p>
                        <button 
                          onClick={() => handleOpenWhatsAppDialog(debtor)}
                          className="text-[9.5px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 mt-1 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 transition-all"
                        >
                          <Send className="w-2.5 h-2.5 text-emerald-600" />
                          Reminder
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setActiveTab('khaata')}
                className="mt-3 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-[10px] uppercase transition-all shrink-0 text-center"
              >
                {t.collectionSchedule}
              </button>
            </div>

          </div>

        </main>
      )}

      {/* TABS: Inventory details view */}
      {activeTab === 'inventory' && (
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Package className="w-6 h-6 text-indigo-600" />
                  Inventory Stock & Profit Metrics
                </h2>
                <p className="text-xs text-slate-400">Total counted: {activeProds.length} unique products. Add items manually or drag Excel/CSV file to parse automatically.</p>
              </div>
              <button 
                onClick={() => setAddProductModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                Add Single Item
              </button>
            </div>

            {/* Smart simulated file uploader */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fast Sheet Import (Excel / Tally csv export)</h3>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  parseMockFile("daily_biling_export_" + new Date().toISOString().split('T')[0] + ".xlsx");
                }}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                }`}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  {uploadedFileName ? `Selected: ${uploadedFileName}` : t.dragDropText}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Click to trigger instant simulator Excel parse</p>
              </div>
              
              {fileImportStats && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {fileImportStats}
                </div>
              )}
            </div>

            {/* D3-Powered Profitability Heatmap (मुनाफा विश्लेषण हीटमैप) */}
            {activeProds.length > 0 ? (() => {
              const uniqueCategories = ['All', ...Array.from(new Set(activeProds.map(p => p.category || 'General')))];
              
              const heatmapProds = activeProds
                .filter(p => heatmapCategoryFilter === 'All' || (p.category || 'General') === heatmapCategoryFilter)
                .map(p => {
                  const margin = p.sellPrice - p.buyPrice;
                  const marginPercent = p.sellPrice > 0 ? Math.round((margin / p.sellPrice) * 100) : 0;
                  const potentialProfit = margin * p.stock;
                  const actualProfit = margin * p.soldQuantity;
                  return {
                    ...p,
                    marginPercent,
                    marginAbsolute: margin,
                    potentialProfit,
                    actualProfit
                  };
                })
                .sort((a, b) => {
                  if (heatmapSortBy === 'marginPercent') return b.marginPercent - a.marginPercent;
                  if (heatmapSortBy === 'marginAbsolute') return b.marginAbsolute - a.marginAbsolute;
                  if (heatmapSortBy === 'potentialProfit') return b.potentialProfit - a.potentialProfit;
                  if (heatmapSortBy === 'stock') return b.stock - a.stock;
                  return a.name.localeCompare(b.name);
                });

              // Derive dynamic min, max, mean margin percent using D3 functions
              const marginValues = heatmapProds.map(p => p.marginPercent);
              const minMarginPercent = d3.min(marginValues) ?? 0;
              const maxMarginPercent = d3.max(marginValues) ?? 50;
              const meanMarginPercent = d3.mean(marginValues) ?? 20;

              // Create robust d3.scaleLinear to map margin percentages to specific accessible colors
              const bgScale = d3.scaleLinear<string>()
                .domain([minMarginPercent, meanMarginPercent, maxMarginPercent])
                .range(['#fee2e2', '#fef3c7', '#dcfce7']) // Red-100, Amber-100, Emerald-100
                .clamp(true);

              const borderScale = d3.scaleLinear<string>()
                .domain([minMarginPercent, meanMarginPercent, maxMarginPercent])
                .range(['#fee2e2', '#fde047', '#4ade80']) // Red-200, Yellow-300, Green-400
                .clamp(true);

              const textScale = d3.scaleLinear<string>()
                .domain([minMarginPercent, meanMarginPercent, maxMarginPercent])
                .range(['#991b1b', '#854d0e', '#166534']) // Red-900, Amber-800, Emerald-850
                .clamp(true);

              // Find current product selected or default to the highest/first sorted product on active filter
              const selectedProduct = heatmapProds.find(p => p.id === selectedHeatmapProductId) || heatmapProds[0];

              // Overall Average Profit Margin stats using D3
              const d3AvgMargin = Math.round(d3.mean(activeProds.map(p => p.sellPrice > 0 ? ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100 : 0)) || 0);

              return (
                <div id="profitability-heatmap-dashboard" className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-inner">
                  {/* Title & Explainer */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        D3 Profitability Heatmap (मुनाफा हीटमैप)
                      </h3>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                        Analyzing products margin ratio. Green cells highlight high yield, Red indicates low threshold. Click any tile to project returns!
                      </p>
                    </div>

                    {/* Overall D3 summary badge */}
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-3 shrink-0">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Average Shop Margin</p>
                        <p className="text-sm font-black font-mono text-indigo-900">{d3AvgMargin}%</p>
                      </div>
                      <div className="w-1.5 h-8 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-indigo-650 h-full" style={{ width: `${d3AvgMargin}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* interactive interactive filtering bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 border border-slate-150 rounded-xl">
                    {/* Category Selector */}
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Filter Heatmap Category</label>
                      <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto">
                        {uniqueCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setHeatmapCategoryFilter(cat);
                              setSelectedHeatmapProductId(null); // Reset select to let it auto-match new set
                            }}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase transition-all shrink-0 cursor-pointer ${
                              heatmapCategoryFilter === cat 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                : 'bg-slate-50 border-slate-250 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort Selector */}
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Sort Grid Order By</label>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => setHeatmapSortBy('marginPercent')}
                          className={`text-[10px] py-1.5 px-2 rounded-lg border text-center font-bold tracking-tight uppercase hover:bg-slate-50 transition-all cursor-pointer ${
                            heatmapSortBy === 'marginPercent' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          Margin % (उच्च मार्जिन)
                        </button>
                        <button
                          onClick={() => setHeatmapSortBy('marginAbsolute')}
                          className={`text-[10px] py-1.5 px-2 rounded-lg border text-center font-bold tracking-tight uppercase hover:bg-slate-50 transition-all cursor-pointer ${
                            heatmapSortBy === 'marginAbsolute' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          Net Markup (₹ margin)
                        </button>
                        <button
                          onClick={() => setHeatmapSortBy('potentialProfit')}
                          className={`text-[10px] py-1.5 px-2 rounded-lg border text-center font-bold tracking-tight uppercase hover:bg-slate-50 transition-all cursor-pointer ${
                            heatmapSortBy === 'potentialProfit' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          Potential Profit
                        </button>
                        <button
                          onClick={() => setHeatmapSortBy('stock')}
                          className={`text-[10px] py-1.5 px-2 rounded-lg border text-center font-bold tracking-tight uppercase hover:bg-slate-50 transition-all cursor-pointer ${
                            heatmapSortBy === 'stock' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/20' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          Remaining Stock
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Heatmap Visual Matrix Dashboard */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-550">
                      <span>Click product block to open project calculator</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-red-100 border border-red-300 rounded inline-block"></span> Low Margin ({minMarginPercent}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded inline-block"></span> Medium Margin ({Math.round(meanMarginPercent)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded inline-block"></span> High Margin ({maxMarginPercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {heatmapProds.map(p => {
                        const cellBg = bgScale(p.marginPercent);
                        const cellBorder = borderScale(p.marginPercent);
                        const cellText = textScale(p.marginPercent);
                        
                        const isSelected = selectedProduct && selectedProduct.id === p.id;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedHeatmapProductId(p.id)}
                            style={{
                              backgroundColor: cellBg,
                              borderColor: isSelected ? '#4f46e5' : cellBorder,
                              color: cellText
                            }}
                            className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.03] flex flex-col justify-between h-[100px] cursor-pointer relative overflow-hidden ${
                              isSelected ? 'shadow-md ring-2 ring-indigo-500/50' : 'hover:shadow-xs'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-black truncate leading-tight">{p.name}</h4>
                              <p className="text-[9px] font-mono opacity-85 truncate uppercase tracking-tighter">{p.category || 'General'}</p>
                            </div>
                            
                            <div className="flex justify-between items-end mt-2">
                              <div>
                                <p className="text-[8px] uppercase font-black opacity-80 leading-none">Margin</p>
                                <p className="text-sm font-black font-mono leading-none mt-1">{p.marginPercent}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] uppercase font-bold opacity-80 leading-none">Stock</p>
                                <p className="text-[10px] font-semibold font-mono mt-0.5">{p.stock} pcs</p>
                              </div>
                            </div>

                            {/* subtle selected node visual tag */}
                            {isSelected && (
                              <span className="absolute top-1 right-1 bg-indigo-600 text-white w-2 h-2 rounded-full ring-2 ring-white"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Return Calculator & In-Depth Report */}
                  {selectedProduct && (
                    <div className="bg-white border text-slate-800 border-indigo-120/45 rounded-xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in relative overflow-hidden">
                      {/* background water reflection logo */}
                      <span className="absolute -bottom-6 -right-6 text-slate-100/40 pointer-events-none font-bold text-6xl">
                        D3
                      </span>

                      {/* Header Column */}
                      <div className="space-y-2 md:border-r md:border-slate-100 md:pr-4">
                        <div className="bg-indigo-50 text-indigo-700 w-9 h-9 rounded-xl flex items-center justify-center font-bold">
                          ₹
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-indigo-600/80 tracking-widest">Active Product Highlight</p>
                          <h4 className="text-sm font-black text-slate-800 tracking-tight">{selectedProduct.name}</h4>
                          <span className="inline-block mt-1 font-black text-[9px] uppercase px-2 py-0.5 rounded-full" style={{
                            backgroundColor: bgScale(selectedProduct.marginPercent),
                            color: textScale(selectedProduct.marginPercent)
                          }}>
                            {selectedProduct.category || 'General'} • {selectedProduct.marginPercent}% Margin
                          </span>
                        </div>
                      </div>

                      {/* Math markup column */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:col-span-2">
                        {/* Box 1: Buying vs Selling */}
                        <div className="bg-slate-50/60 p-3 rounded-lg flex flex-col justify-between">
                          <span className="text-[9px] font-black uppercase text-slate-400">Rate Breakdown</span>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs font-semibold text-slate-500">Buy Price: <span className="font-mono text-slate-800 font-bold">₹{selectedProduct.buyPrice}</span></p>
                            <p className="text-xs font-semibold text-slate-500 font-bold">Sell Price: <span className="font-mono text-indigo-600 font-black">₹{selectedProduct.sellPrice}</span></p>
                          </div>
                          <p className="text-[10px] text-emerald-800 font-bold mt-1.5 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            Marger profit of ₹{selectedProduct.marginAbsolute} per {selectedProduct.unit}
                          </p>
                        </div>

                        {/* Box 2: Potential Profit Projections */}
                        <div className="bg-indigo-50/20 border border-indigo-100/50 p-3 rounded-lg flex flex-col justify-between">
                          <span className="text-[9px] font-black uppercase text-indigo-500">Khaata Profit Ledger</span>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-[11px] font-semibold text-slate-600">Total Sold Revenue: <span className="font-mono text-slate-800 font-bold">₹{selectedProduct.soldQuantity * selectedProduct.sellPrice}</span></p>
                            <p className="text-[11px] font-black text-indigo-950">Net Margin Realised: <span className="font-mono text-indigo-650">₹{selectedProduct.actualProfit}</span></p>
                          </div>
                          <div className="border-t border-indigo-100 mt-2 pt-2">
                            <div className="flex justify-between items-center text-[9px] font-black text-indigo-800/80">
                              <span>Potential Stock Yield</span>
                              <span>₹{selectedProduct.potentialProfit}</span>
                            </div>
                            {/* progress bar */}
                            <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedProduct.stock > 0 ? (selectedProduct.soldQuantity / (selectedProduct.stock + selectedProduct.soldQuantity)) * 100 : 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })() : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-205 flex flex-col items-center justify-center p-6">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Interactive Heatmap Empty (हीटमैप खाली है)</p>
                <p className="text-[11px] text-slate-500 max-w-sm mt-1 leading-normal font-semibold font-sans">
                  The real-time interactive margin comparison matrix compares all stored custom products to find high-margin items. Add items manually to unlock this display!
                </p>
              </div>
            )}

            {/* Entire items table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Buy Price</th>
                    <th className="px-4 py-3">Sell Price</th>
                    <th className="px-4 py-3">Stock Units</th>
                    <th className="px-4 py-3">Sold Units</th>
                    <th className="px-4 py-3">Margin %</th>
                    <th className="px-4 py-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activeProds.map(p => {
                    const margin = p.sellPrice - p.buyPrice;
                    const marginPercent = p.sellPrice > 0 ? Math.round((margin / p.sellPrice) * 100) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>{p.name}</span>
                            {p.stock < 10 && (
                              <span className="bg-red-50 text-red-600 border border-red-150 text-[8.5px] px-1.5 py-0.2 rounded font-black animate-pulse">
                                ⚠️ Low Stock
                              </span>
                            )}
                            {marginPercent < 10 && (
                              <span className="bg-amber-50 text-amber-750 border border-amber-200 text-[8.5px] px-1.5 py-0.2 rounded font-black">
                                💡 Thin Margin
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-wider">{p.barcode || '89000000000'}</p>
                          
                          {/* Option C action buttons */}
                          <div className="flex gap-2 mt-1.5">
                            {p.stock < 10 && (
                              <button
                                onClick={() => {
                                  setProducts(prev => {
                                    const list = prev[activeShopId] || [];
                                    const updated = list.map(item => item.id === p.id ? { ...item, stock: item.stock + 50 } : item);
                                    return { ...prev, [activeShopId]: updated };
                                  });
                                  triggerToast(`Restocked +50 units for ${p.name}!`);
                                }}
                                className="text-[8.5px] font-black uppercase bg-slate-100 hover:bg-slate-200 text-slate-650 px-1.5 py-0.5 rounded tracking-wider border border-slate-250 cursor-pointer transition-all active:scale-95"
                              >
                                ⚡ Restock +50 (सामान भरें)
                              </button>
                            )}
                            {marginPercent < 10 && (
                              <button
                                onClick={() => {
                                  const suggestedPrice = Math.round(p.buyPrice * 1.25);
                                  setProducts(prev => {
                                    const list = prev[activeShopId] || [];
                                    const updated = list.map(item => item.id === p.id ? { ...item, sellPrice: suggestedPrice } : item);
                                    return { ...prev, [activeShopId]: updated };
                                  });
                                  triggerToast(`Optimized ${p.name} selling price to ₹${suggestedPrice} (20% margin markup)!`);
                                }}
                                className="text-[8.5px] font-black uppercase bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded tracking-wider border border-indigo-200 cursor-pointer transition-all active:scale-95"
                              >
                                📈 Set 20% sell rate: ₹{Math.round(p.buyPrice * 1.25)}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-500 uppercase">{p.category || 'General'}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">₹{p.buyPrice}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-750">₹{p.sellPrice}</td>
                        <td className="px-4 py-3.5">
                          <span className={`font-black ${p.stock < 10 ? 'text-red-600' : 'text-slate-700'}`}>{p.stock} pcs</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{p.soldQuantity} sold</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${marginPercent < 8 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                            {marginPercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button 
                            onClick={() => {
                              setProducts(prev => ({
                                ...prev,
                                [activeShopId]: (prev[activeShopId] || []).filter(item => item.id !== p.id)
                              }));
                              triggerToast(`Deleted ${p.name}`);
                            }}
                            className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      )}

      {/* TABS: Khaata (Udhaar Register) details view */}
      {activeTab === 'khaata' && (
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-500 animate-pulse" />
                  Khaata Book (उधार रजिस्टर)
                </h2>
                <p className="text-xs text-slate-400">Manage pending bills. Send automatic WhatsApp payment reminders directly to customer phones.</p>
              </div>
            </div>

            {/* Debtor metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">Outstanding Balance</p>
                <p className="text-2xl font-black text-orange-600 mt-1">₹{activeOutstandingUdhaarSum.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">Debtors Active Count</p>
                <p className="text-2xl font-black text-slate-800 mt-1">
                  {activeUdhaars.filter(u => u.status === 'pending').length} Customers
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Payment Collection State</p>
                  <p className="text-xs text-slate-400 mt-1">Click reminder next to anyone to recover money instantly.</p>
                </div>
              </div>
            </div>

            {/* Sync Contacts action bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-emerald-50 via-indigo-50 to-indigo-100/40 border border-emerald-100/80 rounded-xl p-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                  <Users className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                    Phonebook Autolink Active (ऑटोमैटिक फोनबुक लिंक चालू है)
                    <span className="bg-emerald-500 w-2 h-2 rounded-full inline-block animate-ping"></span>
                  </h3>
                  <div className="text-[11px] text-slate-600 font-bold mt-0.5 space-y-0.5">
                    <p className="text-emerald-700">🟢 Connected: {activeShop.ownerName || 'Owner'}'s mobile phonebook has loaded ({deviceContacts.length} contacts automatically synced).</p>
                    <p className="text-slate-500 font-semibold">No need to save or recreate customers manually. Select them instantly, bill them, or add credits with 1-click!</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpenContactsModal(true)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 animate-pulse" />
                Dukaan Contacts Book ({deviceContacts.length})
              </button>
            </div>

            {/* List block */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Registered Debtors list</h3>
              <div className="space-y-2">
                {activeUdhaars.map(debtor => (
                  <div key={debtor.id} className="border border-slate-250 hover:border-indigo-150 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold rounded-full flex items-center justify-center text-sm shadow-inner">
                        {debtor.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{debtor.customerName}</h4>
                          <span className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${debtor.status === 'settled' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-850'}`}>
                            {debtor.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          WhatsApp: <span className="font-mono">{debtor.phone}</span> • Date added: {debtor.date} ({debtor.daysAgo} days ago)
                        </p>
                        <p className="text-[10px] text-indigo-600 font-bold mt-0.5">Bills associated: {debtor.bills.join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <div className="text-left md:text-right mr-2">
                        <p className="text-xs font-bold text-slate-400">Total Outstanding</p>
                        <p className="text-lg font-black text-slate-900">₹{debtor.amount}</p>
                      </div>
                      
                      {debtor.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => settleDebtorAccount(debtor.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs shadow-md transition-all active:scale-95"
                          >
                            Mark Settled
                          </button>
                          <button 
                            onClick={() => handleOpenWhatsAppDialog(debtor)}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Remind
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                ))}
                {activeUdhaars.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 border border-slate-205 rounded-2xl border-dashed">
                    <User className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-pulse" />
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">No Udhaar accounts registered / कोई उधार खाता नहीं है</p>
                    <p className="text-[11px] text-slate-500 mt-1.5 max-w-xs mx-auto px-4 font-sans leading-normal">
                      When you process custom orders, toggle "Add to Customer Credit Ledger" during billing checkout to automatically post accounts here!
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* TABS: Settings details view */}
      {activeTab === 'settings' && (
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-600" />
              {t.settings} & Multi-shop Configuration
            </h2>
            
            {/* active shop profile review */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Selected Shop Coordinates</h3>
              <p className="text-sm font-bold text-slate-800">{activeShop.name}</p>
              <p className="text-xs text-slate-500 mt-1">Owner Name: {activeShop.ownerName}</p>
              <p className="text-xs text-slate-500 mt-0.5">Phone (Reminders sender name): {activeShop.phone}</p>
              <p className="text-xs text-slate-500 mt-0.5">City: {activeShop.location}</p>
              <p className="text-xs font-bold text-indigo-600 mt-1 uppercase">Working style: {activeShop.type === 'manual' ? 'Manual book entry' : 'Digital spreadsheet import'}</p>
            </div>

            {/* active listing of shops */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">All Managed Shops under account</h3>
              <div className="space-y-2">
                {shops.map(sh => (
                  <div key={sh.id} className="border border-slate-250 p-3.5 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs font-black text-slate-800">{sh.name}</p>
                        <p className="text-[10px] text-slate-500">{sh.location} • {sh.ownerName}</p>
                      </div>
                    </div>
                    {sh.id !== activeShopId ? (
                      <button 
                        onClick={() => setActiveShopId(sh.id)}
                        className="text-xs font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded"
                      >
                        Switch To
                      </button>
                    ) : (
                      <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setAddShopModalOpen(true)}
              className="w-full bg-slate-905 bg-indigo-600 text-white font-black py-3 rounded-lg text-xs uppercase tracking-wider text-center"
            >
              Add New Shop
            </button>

            {/* Language Selection coordinates */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">System Language</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {allLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      triggerToast(`Language updated to ${l.name}`);
                    }}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center uppercase tracking-wide transition-all ${
                      language === l.code ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsOpenCustomLangModal(true)}
                  className="py-2 px-1 text-[11px] font-bold rounded-lg border border-dashed border-indigo-300 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-center uppercase tracking-wide transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Custom Lang
                </button>
              </div>
            </div>

            {/* Backup & Security section */}
            <div className="space-y-3 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-505 tracking-wider flex items-center gap-1.5 text-slate-500">
                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                Data Backup & Security (डेटा बैकअप सुरक्षित करें)
              </h3>
              <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                Download a secure offline copy of all your registered shops, custom products catalog inventories, customer ledger accounts, and transaction records. You can keep this file safe on your device as an archive.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleBackupData}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Backup Data (डाउनलोड)</span>
                </button>

                <label className="bg-slate-100 hover:bg-slate-150 border border-slate-300 text-slate-700 font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4 shrink-0 text-slate-600" />
                  <span>Restore Data (रीस्टोर)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Demo Testing Sandbox */}
            <div className="space-y-3 pt-5 border-t border-slate-100 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-indigo-800">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                Demo Testing Sandbox (डेमो सैंपल डेटा)
              </h3>
              <p className="text-[11px] font-semibold text-indigo-950/80 leading-normal">
                New accounts start completely clean so you can log your actual products. Want to see how the app looks with active items? Load temporary demo products, sales graphs, and customer records instantly!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleLoadDemoData}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Load Sample Data (डेमो डालें)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearShopData}
                  className="bg-white hover:bg-red-50 border border-red-200 text-red-650 font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4 shrink-0 text-red-500" />
                  <span>Clear All Data (शून्य करें)</span>
                </button>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* BOTTOM ACTION TABS NAVIGATION BAR */}
      <div className="h-16 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 fixed bottom-0 left-0 right-0 sm:sticky">
        <div className="flex gap-4 md:gap-8">
          
          {/* Dashboard trigger */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-tighter">{t.dashboard}</span>
          </button>

          {/* Inventory trigger */}
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center transition-all ${activeTab === 'inventory' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-tighter">Inventory</span>
          </button>

          {/* Khaata trigger */}
          <button 
            onClick={() => setActiveTab('khaata')}
            className={`flex flex-col items-center transition-all ${activeTab === 'khaata' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-tighter">Khaata Diary</span>
          </button>

          {/* Settings trigger */}
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center transition-all ${activeTab === 'settings' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-extrabold mt-1 uppercase tracking-tighter">{t.settings}</span>
          </button>

        </div>

        {/* Primary Checkout / scanner direct quick modals */}
        <div className="flex gap-2">
          
          {/* Quick Billing */}
          <button 
            onClick={() => setBillingModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2 rounded-full flex items-center gap-1.5 shadow-md transition-all active:scale-95 font-extrabold text-xs"
          >
            <Plus className="w-4 h-4" />
            {t.newBilling}
          </button>

          {/* Barcode scan simulator modal */}
          <button 
            onClick={() => {
              setBarcodeModalOpen(true);
              setScanResult({ status: 'idle' });
              setBarcodeScanInput('');
            }}
            className="bg-slate-900 hover:bg-black text-white px-3 md:px-4 py-2 rounded-full flex items-center gap-1.5 shadow border border-slate-800 transition-all active:scale-95 font-extrabold text-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Barcode
          </button>

        </div>
      </div>

      {/* MODAL: OPTION B - PRINTABLE THERMAL RECEIPT + UPI QR CODE PAYER */}
      {recentInvoice && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in" id="recent-invoice-modal">
          <div className="bg-slate-100 rounded-3xl max-w-md w-full border border-slate-300 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">
            {/* Top decorative bar */}
            <div className="bg-indigo-600 h-2 w-full"></div>

            <div className="px-5 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 animate-bounce" />
                <h3 className="font-extrabold text-slate-805 text-sm">
                  Bill Saved! (बिल सहेजा गया)
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setRecentInvoice(null)}
                className="text-slate-400 hover:text-slate-605 font-extrabold text-lg p-1.5 hover:bg-slate-100 rounded-full transition-all"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              
              {/* Receipt Ticket container */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden" id="thermal-receipt-view">
                {/* Simulated side punch holes for physical ticket feel */}
                <span className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-100 rounded-full border border-slate-200"></span>
                <span className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-100 rounded-full border border-slate-200"></span>

                {/* Receipt Header */}
                <div className="text-center border-b border-dashed border-slate-200 pb-4 mb-4">
                  <h4 className="font-black text-lg tracking-tight text-slate-900 uppercase">
                    {activeShop.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Prop: {activeShop.ownerName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Ph: {activeShop.phone} • {activeShop.location}
                  </p>
                  <div className="mt-2.5 inline-block bg-slate-100 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-slate-600">
                    Inv No: {recentInvoice.billId}
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono mt-1">Date: {recentInvoice.date}</p>
                </div>

                {/* Customer Details */}
                <div className="mb-4 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Bill To (ग्राहक):</span>
                    <span className="font-extrabold text-slate-800">{recentInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500 font-semibold">Pay Mode (भुगतान प्रकार):</span>
                    <span className="font-extrabold text-indigo-650 uppercase px-1.5 py-0.2 ml-1 rounded text-[9.5px] bg-indigo-50 border border-indigo-150 inline-block font-mono">
                      {recentInvoice.paymentMode === 'upi' ? '⚡ UPI Scan' : '💵 Cash'}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="text-[11px] mb-4 space-y-2">
                  <div className="grid grid-cols-12 font-black uppercase text-slate-400 tracking-wider text-[8px] border-b border-slate-150 pb-1">
                    <span className="col-span-6">Item (विवरण)</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Rate</span>
                    <span className="col-span-2 text-right">Amt</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
                    {recentInvoice.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 py-2 text-slate-700 font-semibold">
                        <span className="col-span-6 font-bold truncate pr-1">{item.product.name}</span>
                        <span className="col-span-2 text-center font-mono">{item.quantity} {item.product.unit}</span>
                        <span className="col-span-2 text-right font-mono">₹{item.product.sellPrice}</span>
                        <span className="col-span-2 text-right font-mono font-bold text-slate-900">₹{item.product.sellPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown columns */}
                  <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 font-bold">
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Subtotal (कुल मूल्य)</span>
                      <span className="font-mono">₹{recentInvoice.total}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>CGST (2.5%)</span>
                      <span className="font-mono">₹{Math.round(recentInvoice.total * 0.025 * 100) / 100}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>SGST (2.5%)</span>
                      <span className="font-mono">₹{Math.round(recentInvoice.total * 0.025 * 100) / 100}</span>
                    </div>
                    <div className="flex justify-between text-slate-800 text-[12px] font-black border-t border-slate-150 pt-2">
                      <span className="uppercase tracking-wider">Grand Total (कुल भुगतान)</span>
                      <span className="font-mono text-indigo-750">₹{recentInvoice.total}</span>
                    </div>
                  </div>
                </div>

                {/* Option B Instant UPI QR Pay Code Scanner */}
                {recentInvoice.paymentMode === 'upi' && (
                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-200 text-center flex flex-col items-center gap-2 mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <p className="text-[9.5px] font-black uppercase text-indigo-805 tracking-wider">Scan QR code to pay (स्कैन करके भुगतान करें)</p>
                    </div>
                    
                    {/* Live QR generator from google charts API using upi://pay */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200 transform hover:scale-[1.02] transition-all shrink-0 shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          `upi://pay?pa=${activeShop.phone || '9999999999'}@upi&pn=${encodeURIComponent(activeShop.name)}&am=${recentInvoice.total}&cu=INR`
                        )}`}
                        alt="UPI Payment QR Code"
                        className="w-28 h-28 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-705 font-mono">₹{recentInvoice.total}</p>
                      <p className="text-[9px] text-slate-400 font-bold">UPI ID: {activeShop.phone || '9999999999'}@upi</p>
                    </div>
                  </div>
                )}

                {/* Footer Greeting */}
                <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-200 text-slate-400">
                  <p className="text-[9px] font-black uppercase">Thank you! Visit again!</p>
                  <p className="text-[8px] font-bold">धन्यवाद! फिर पधारें।</p>
                </div>
              </div>

              {/* Action Buttons: Print, WhatsApp share, Close */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Simulating actual thermal printer request via direct text copy as print backup
                    const billText = `
-----------------------------
    ${activeShop.name.toUpperCase()}
    Prop: ${activeShop.ownerName}
    Ph: ${activeShop.phone}
-----------------------------
Inv No: ${recentInvoice.billId}
Date: ${recentInvoice.date}
Customer: ${recentInvoice.customerName}
-----------------------------
Item           Qty    Rate   Total
${recentInvoice.items.map(i => `${i.product.name.slice(0, 14).padEnd(14)} ${i.quantity.toString().padEnd(6)} ₹${i.product.sellPrice.toString().padEnd(6)} ₹${(i.product.sellPrice * i.quantity).toString()}`).join('\n')}
-----------------------------
TOTAL AMOUNT:  ₹${recentInvoice.total}
-----------------------------
Thank you! Visit again!
`;
                    navigator.clipboard.writeText(billText);
                    triggerToast("Bill details copied! Print layout prepared on clipboard.");
                    window.print();
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  Print (प्रिंट)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const message = `*${activeShop.name}*\nHi ${recentInvoice.customerName}, your invoice *${recentInvoice.billId}* is created.\nTotal Amount: *₹${recentInvoice.total}*\nPayment Mode: ${recentInvoice.paymentMode === 'upi' ? 'UPI' : 'Cash'}\n\nThank you for shopping with us!\n- Powered by Dukaan Saathi`;
                    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                    triggerToast("Opening WhatsApp share template!");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-white animate-pulse" />
                  WhatsApp (व्हाट्सएप)
                </button>
              </div>

            </div>

            {/* Bottom Complete CTA */}
            <div className="bg-white px-5 py-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setRecentInvoice(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs tracking-wider uppercase shadow-md hover:shadow-lg active:scale-98 cursor-pointer transition-all text-center"
              >
                Complete & New Bill (नया बिल बनाएं)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW BILLING CLIENT */}
      {billingModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleCheckoutBill} className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-855 flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-indigo-600" />
                Dukaan Quick Invoicing Billing
              </h3>
              <button 
                type="button" 
                onClick={() => setBillingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              
              {/* Select items to add on billing cart */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider block">Add item to invoice</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activeProds.map(prod => (
                    <button 
                      key={prod.id} 
                      type="button"
                      onClick={() => addToBillingCart(prod)}
                      className="text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-2.5 rounded-xl transition-all"
                    >
                      <p className="text-xs font-black text-slate-800 truncate">{prod.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-indigo-600 font-bold">₹{prod.sellPrice}</span>
                        <span className="text-[9px] text-slate-400">Stock: {prod.stock}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items in the checkout cart */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Bill Products list</h4>
                {billingCart.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-3 text-center">Your bill is empty. Select items above to add.</p>
                ) : (
                  <div className="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100 max-h-[160px] overflow-y-auto">
                    {billingCart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-105 border-b border-slate-100/50 last:border-0 rounded">
                        <div className="font-bold flex-1">
                          <p>{item.product.name}</p>
                          <span className="text-[9px] text-slate-400 font-normal">₹{item.product.sellPrice} / unit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-5 h-5 bg-white border border-slate-300 text-slate-600 rounded flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs">{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-5 h-5 bg-white border border-slate-300 text-slate-600 rounded flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                          
                          <button 
                            type="button" 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-300 hover:text-rose-600 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Split & Mode */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-1">Pay option</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      type="button"
                      onClick={() => setBillingPayMode('upi')}
                      className={`flex-1 text-center py-1.5 rounded text-xs font-bold ${billingPayMode === 'upi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      UPI
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBillingPayMode('cash')}
                      className={`flex-1 text-center py-1.5 rounded text-xs font-bold ${billingPayMode === 'cash' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      Cash
                    </button>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-end">
                  <p className="text-xs text-slate-400 uppercase font-bold">Total Bill amount</p>
                  <p className="text-2xl font-black text-indigo-900">
                    ₹{billingCart.reduce((sum, item) => sum + (item.product.sellPrice * item.quantity), 0)}
                  </p>
                </div>
              </div>

              {/* Udhaar selection */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isBillUdhaar}
                    onChange={e => setIsBillUdhaar(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 text-sm focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-orange-600 uppercase">Write as Udhaar (क्रेडिट खाता)</span>
                </label>

                {isBillUdhaar && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-slate-550 block">Customer / Debtor Name</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsOpenContactsModal(true);
                          setBillingModalOpen(false); // Close billing to focus on phonebook
                        }}
                        className="text-[10px] text-indigo-650 font-extrabold uppercase hover:underline flex items-center gap-1"
                      >
                        <Users className="w-3 h-3 text-indigo-500" />
                        Select Synced Contact
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={newBillCustomerName}
                        onChange={e => setNewBillCustomerName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                      />
                    </div>

                    {/* Quick suggestion match listing */}
                    {deviceContacts.filter(c => c.name.toLowerCase().includes(newBillCustomerName.toLowerCase())).length > 0 && (
                      <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-md max-h-[140px] overflow-y-auto">
                        <div className="bg-slate-50 px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Suggested Synced Phonebook Match</span>
                          <span className="text-[9px] font-bold text-indigo-600">WhatsApp List</span>
                        </div>
                        <div className="p-1 space-y-0.5">
                          {deviceContacts
                            .filter(c => {
                              if (!newBillCustomerName.trim()) return true; // show all available if input blank
                              return c.name.toLowerCase().includes(newBillCustomerName.toLowerCase());
                            })
                            .slice(0, 4)
                            .map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setNewBillCustomerName(c.name);
                                  triggerToast(`Linked to synced contact: ${c.name}`);
                                }}
                                className="w-full flex items-center justify-between text-left px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 rounded-lg transition-all"
                              >
                                <span className="truncate">{c.name}</span>
                                <span className="font-mono text-[10px] text-slate-400 font-medium">({c.phone})</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setBillingModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md"
              >
                Create Invoice & checkout
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: BARCODE SCAN SIMULATOR */}
      {barcodeModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">{t.barcodeModalTitle}</h3>
              <button 
                onClick={() => setBarcodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              
              {/* Animated simulator scanner box representing physical device laser lens */}
              <div className="w-full h-36 bg-slate-950 rounded-xl relative overflow-hidden flex flex-col justify-center items-center text-slate-100 select-none">
                <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse z-10"></div>
                <div className="absolute top-4 bottom-4 left-1/4 right-1/4 border-2 border-dashed border-emerald-500/50 rounded pointer-events-none"></div>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest absolute top-2 uppercase">Integrated Cam lens Simulator</span>
                <Sparkles className="w-8 h-8 text-slate-500 animate-spin mb-1" />
                <span className="text-xs text-slate-400">Position barcode clearly inside</span>
              </div>

              {/* simulated prompt shortcuts */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1">
                <p className="font-bold text-indigo-700">Scan Simulation Shortcuts (Click to type instantly):</p>
                <div className="flex flex-wrap gap-1">
                  <button 
                    onClick={() => setBarcodeScanInput('8901262010113')} 
                    className="bg-white border rounded px-1 text-slate-600 font-mono"
                  >
                    Amul Butter (8901262010113)
                  </button>
                  <button 
                    onClick={() => setBarcodeScanInput('8901058002475')} 
                    className="bg-white border rounded px-1 text-slate-600 font-mono"
                  >
                    Maggi (8901058002475)
                  </button>
                </div>
              </div>

              {/* barcode field scan */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Input Barcode barcode number or Item keyword</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={barcodeScanInput}
                    onChange={e => setBarcodeScanInput(e.target.value)}
                    placeholder="e.g. 8901262010113"
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold font-mono"
                  />
                  <button 
                    onClick={simulateBarcodeScan}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
                  >
                    {t.scanNowBtn}
                  </button>
                </div>
              </div>

              {/* scan results analysis block */}
              {scanResult.status === 'found' && scanResult.product && (
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-black text-emerald-800">{t.itemFound}</h5>
                    <p className="font-bold text-slate-800 mt-1">{scanResult.product.name}</p>
                    <p className="text-[10px] text-slate-500">Sell Price: ₹{scanResult.product.sellPrice} • Stock: {scanResult.product.stock}</p>
                  </div>
                  <span className="text-xl">✅</span>
                </div>
              )}

              {scanResult.status === 'not_found' && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-xs space-y-2">
                  <p className="font-bold text-rose-800">{t.itemNotFound}</p>
                  <button 
                    onClick={handleQuickAddScannedItem}
                    className="w-full bg-rose-600 text-white text-xs font-bold py-1.5 rounded-lg border border-rose-700 shadow"
                  >
                    {t.addNewItemText} (₹100)
                  </button>
                </div>
              )}

            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setBarcodeModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-705 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SINGLE PRODUCT INVENTORY */}
      {addProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleAddProduct} className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">New Stock Product details</h3>
              <button 
                type="button" 
                onClick={() => setAddProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Product label Name</label>
                <input 
                  type="text" 
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="e.g. Parle G 100g"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Cost / Buy Price</label>
                  <input 
                    type="number" 
                    required
                    value={newProdBuy}
                    onChange={e => setNewProdBuy(e.target.value)}
                    placeholder="₹8"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Selling Price</label>
                  <input 
                    type="number" 
                    required
                    value={newProdSell}
                    onChange={e => setNewProdSell(e.target.value)}
                    placeholder="₹10"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Starting Stock quantity</label>
                  <input 
                    type="number" 
                    value={newProdStock}
                    onChange={e => setNewProdStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Measuring Unit</label>
                  <select 
                    value={newProdUnit} 
                    onChange={e => setNewProdUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                  >
                    <option value="pcs">pcs / Unit</option>
                    <option value="pack">Pack</option>
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">UPC / Barcode (Optional for scanning)</label>
                <input 
                  type="text" 
                  value={newProdBarcode}
                  onChange={e => setNewProdBarcode(e.target.value)}
                  placeholder="e.g. 8901166113110"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setAddProductModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD SHOP */}
      {addShopModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleAddShopSubmit} className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">{t.addShop}</h3>
              <button 
                type="button" 
                onClick={() => setAddShopModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.shopNameLabel}</label>
                <input 
                  type="text" 
                  required
                  value={newShopName}
                  onChange={e => setNewShopName(e.target.value)}
                  placeholder="e.g. Sai Medical Hall"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.ownerNameLabel}</label>
                  <input 
                    type="text" 
                    required
                    value={newShopOwner}
                    onChange={e => setNewShopOwner(e.target.value)}
                    placeholder="Owner"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.locationLabel}</label>
                  <input 
                    type="text" 
                    value={newShopCity}
                    onChange={e => setNewShopCity(e.target.value)}
                    placeholder="Jalgaon"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">{t.phoneLabel}</label>
                <input 
                  type="text" 
                  value={newShopPhone}
                  onChange={e => setNewShopPhone(e.target.value)}
                  placeholder="WhatsApp phone number"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs outline-none font-semibold"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setAddShopModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow"
              >
                Create Shop
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WHATSAPP MESSAGE REMINDER SHARE BOX */}
      {whatsappDialogData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">{t.previewMessage}</h3>
              <button 
                onClick={() => setWhatsappDialogData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-500">
                Draft reminder message to <span className="font-bold text-indigo-950">{whatsappDialogData.customerName}</span> ({whatsappDialogData.phone}) regarding outstanding <span className="font-bold text-orange-600">₹{whatsappDialogData.amount}</span>:
              </p>

              {/* Editable SMS bubble display */}
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs font-medium text-emerald-950 relative space-y-1.5 shadow-inner">
                <span className="text-[10px] font-black text-emerald-600 uppercase block">Draft SMS preview:</span>
                <textarea 
                  value={whatsappDialogData.customMessage}
                  rows={4}
                  onChange={e => {
                    const txt = e.target.value;
                    setWhatsappDialogData(prev => prev ? { ...prev, customMessage: txt } : null);
                  }}
                  className="w-full bg-white border border-emerald-200 rounded p-2 text-xs font-sans outline-none font-semibold text-emerald-900 focus:border-emerald-500"
                />
              </div>

              {whatsappDialogData.copied && (
                <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-lg text-[10px] font-bold text-center">
                  ✔️ Draft copied to clipboard! Opening WhatsApp share link...
                </div>
              )}

              <button 
                onClick={triggerMockWhatsAppSend}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-lg text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4 text-white" />
                {t.sendWhatsappMsg}
              </button>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setWhatsappDialogData(null)}
                className="bg-white border border-slate-200 text-slate-705 text-xs font-bold px-4 py-2 rounded-xl"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANY LANGUAGE TRANSLATOR MODAL */}
      {isOpenCustomLangModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-slate-805">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col transform transition-all scale-100">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => { if (!isTranslating) setIsOpenCustomLangModal(false); }}
                  className="p-1.5 rounded-lg bg-indigo-750 hover:bg-indigo-800 text-indigo-105 hover:text-white transition-all cursor-pointer mr-0.5"
                  title="Go Back / cancel (पीछे जाएं)"
                  disabled={isTranslating}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-indigo-100 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">Translate App (भाषा चुनें)</h3>
                    <p className="text-[9px] text-indigo-200 font-bold tracking-tight">Run business in any native language</p>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { if (!isTranslating) setIsOpenCustomLangModal(false); }}
                className="w-8 h-8 rounded-full bg-indigo-700/50 hover:bg-indigo-800 text-indigo-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-inner shrink-0"
                disabled={isTranslating}
                title="Close / बंद करें"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Type the name of <strong>any language in the world</strong> (e.g., <em>Bengali, Gujarati, Punjabi, Kannada, French, Spanish, Russian, Arabic</em>). Gemini will instantly translate the entire app interface so you can run your shop in your favorite language!
              </p>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 font-sans">Enter Language Name:</label>
                <input 
                  type="text" 
                  value={typedCustomLang}
                  disabled={isTranslating}
                  onChange={e => setTypedCustomLang(e.target.value)}
                  placeholder="e.g. Gujarati, Punjabi, Bengali, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

              {translationError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 leading-snug">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{translationError}</span>
                </div>
              )}

              {isTranslating ? (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs flex flex-col justify-center items-center gap-3 text-indigo-900 shadow-inner overflow-hidden">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                  <div className="text-center font-bold space-y-1">
                    <p>AI Saathi is translating all 50+ interfaces into <span className="text-indigo-700 underline underline-offset-2">{typedCustomLang}</span>...</p>
                    <p className="text-[10px] text-slate-400 font-medium font-mono">This usually takes about 5-10 seconds. Please hold tight!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1">
                  <span className="col-span-full text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 font-sans">Quick Suggestions:</span>
                  {['Gujarati', 'Bengali', 'Punjabi', 'Kannada', 'Malayalam', 'French', 'German'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setTypedCustomLang(sug)}
                      className="text-[10px] py-1.5 px-2 font-black rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all text-center cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              <button 
                onClick={() => handleCreateCustomLanguage(typedCustomLang)}
                disabled={isTranslating || !typedCustomLang.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-100 disabled:text-indigo-300 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <Sparkles className="w-4 h-4" />
                {isTranslating ? "Translating with Gemini..." : "Start AI Translation"}
              </button>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button 
                type="button"
                onClick={() => setIsOpenCustomLangModal(false)}
                disabled={isTranslating}
                className="text-xs uppercase font-black text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back (वापस)</span>
              </button>
              <button 
                type="button"
                onClick={() => setIsOpenCustomLangModal(false)}
                disabled={isTranslating}
                className="bg-white border border-slate-250 text-slate-700 text-xs font-black px-4.5 py-2.5 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer shadow-xs uppercase tracking-wider"
              >
                ✕ Cancel (रद्द करें)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WHATSAPP & PHONE CONTACTS LINK DESK */}
      {isOpenContactsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transform transition-all scale-100">
            
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-100 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Owner's Contacts & WhatsApp Sync</h3>
                  <p className="text-[10px] text-indigo-200 font-bold tracking-tight">Sync mobile phonebook • Quick-import to Khaata register</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpenContactsModal(false)}
                className="text-indigo-200 hover:text-white font-black text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              
              {/* Top Banner explaining connection */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block animate-ping"></span>
                    Live WhatsApp Bridge Link
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug font-semibold max-w-md">
                    Importing contacts links their real phone numbers down to the Khaata dashboard, allowing automated one-click custom WhatsApp payment notifications.
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={handleSyncContactsFromPhone}
                    disabled={isSyncingContacts}
                    className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingContacts ? 'animate-spin' : ''}`} />
                    {isSyncingContacts ? "Syncing..." : "Sync Phonebook"}
                  </button>
                </div>
              </div>

              {/* Form to Add contact directly into current Simulated Contacts Book database */}
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                  Add Contact directly to mobile database (डायरेक्ट फोनबुक में जोड़ें)
                </h4>
                <form onSubmit={handleAddNewContactDevice} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Customer Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Ramesh Pal"
                      value={newContactName}
                      onChange={e => setNewContactName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">WhatsApp / Phone Number</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={newContactPhone}
                      onChange={e => setNewContactPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-xs font-bold font-mono outline-none"
                    />
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1">
                      <select 
                        value={newContactOrigin} 
                        onChange={e => setNewContactOrigin(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-1.5 px-2 text-xs font-bold outline-none"
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Google Contacts">Google Contact</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs tracking-wider flex items-center gap-1 shadow transition-all shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Save
                    </button>
                  </div>
                </form>
              </div>

              {/* Core contacts list section */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded-lg">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Synced Mobile list matching search</span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Total Synced: {deviceContacts.length} Contacts</span>
                </div>

                {/* Filter Search Field */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="text"
                    placeholder="Search by Name or Phone in synchronized WhatsApp list..."
                    value={contactSearchQuery}
                    onChange={e => setContactSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 px-9 text-xs outline-none font-bold placeholder-slate-400 transition-all"
                  />
                  {contactSearchQuery && (
                    <button 
                      onClick={() => setContactSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Listing */}
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {deviceContacts
                    .filter(c => {
                      const query = contactSearchQuery.toLowerCase();
                      return c.name.toLowerCase().includes(query) || c.phone.includes(query);
                    })
                    .map(contact => {
                      const inCurrentKhaata = (udhaars[activeShopId] || []).some(u => u.phone === contact.phone);

                      return (
                        <div key={contact.id} className="border border-slate-150 hover:border-indigo-200 hover:bg-slate-50/50 p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                              {contact.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-800">{contact.name}</p>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full ${contact.origin === 'WhatsApp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                  {contact.origin}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Phone (reminders link): {contact.phone}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {inCurrentKhaata ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border border-emerald-200">
                                <Check className="w-3.5 h-3.5" />
                                Linked in Khaata
                              </span>
                            ) : (
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => {
                                    // Quick selective link and return to checkout if they wanted to checkout
                                    handleImportContactToKhaata(contact);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 shadow transition-all active:scale-95"
                                >
                                  <Plus className="w-3 h-3" />
                                  Link Customer
                                </button>
                                <button 
                                  onClick={() => {
                                    // Prepopulate billing customer and reopen modal
                                    setNewBillCustomerName(contact.name);
                                    setIsBillUdhaar(true);
                                    setIsOpenContactsModal(false);
                                    setBillingModalOpen(true);
                                    triggerToast(`Selected "${contact.name}" for custom invoice!`);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-black text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1"
                                >
                                  Billing Select
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {deviceContacts.filter(c => {
                    const query = contactSearchQuery.toLowerCase();
                    return c.name.toLowerCase().includes(query) || c.phone.includes(query);
                  }).length === 0 && (
                    <p className="text-xs text-center py-6 text-slate-400">No matching contacts available in your synced WhatsApp phonebook.</p>
                  )}
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Dukaan Saathi PWA Sync Engine v1.1</span>
              <button 
                onClick={() => setIsOpenContactsModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
              >
                ✕ Finished
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: KEYBOARD SHORTCUTS DESK */}
      {isOpenShortcutsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transform transition-all scale-100">
            
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-100 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Fast-Track Keyboard Shortcuts</h3>
                  <p className="text-[10px] text-indigo-200 font-bold tracking-tight">Power keys to manage billing, scanning & tabs instantly!</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpenShortcutsModal(false)}
                className="text-indigo-200 hover:text-white font-black text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">💡 Power User Tip (शॉर्टकट टिप)</p>
                <p className="text-xs font-semibold text-slate-600 mt-1 leading-snug">
                  Use these modifiers combined with the keys below. To avoid browser clashes, <strong className="text-indigo-600 font-extrabold">Alt + Key</strong> is highly recommended!
                </p>
              </div>

              {/* Group 1: Transactions and Invoicing */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  Invoicing & Barcode Tools (बिलिंग और स्कैनिंग)
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Toggle New Invoice Modal (नया बिल)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + N</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Ctrl + N</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Toggle Barcode Scan / Search (बारकोड)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + B</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Ctrl + B</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Tab Switching Navigation */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  Quick Navigation Tabs (जल्दी टैब बदलें)
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Dashboard Home (डैशबोर्ड)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + 1</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + H</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Inventory Stock & Heatmap (इन्वेंटरी)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + 2</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + I</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Khaata Balances Directory (खाता बही)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + 3</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + K</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Control Panel Settings (सेटिंग्स)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + 4</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + S</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Directory and Addition Utilities */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  Quick Adding Utilities (डायरेक्ट एडिशन)
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Add New Inventory Item (नया प्रोडक्ट)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + P</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Ctrl + P</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">WhatsApp Phonebook Contacts (कांटेक्ट लिस्ट)</span>
                    <div className="flex gap-1.5">
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + C</kbd>
                      <span className="text-slate-300 text-xs">or</span>
                      <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + U</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                    <span className="text-xs font-bold text-slate-700">Shortcuts Help Desk (यह गाइड)</span>
                    <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-mono font-black shadow-xs">Alt + /</kbd>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Dukaan Saathi PWA Sync Engine v1.1</span>
              <button 
                onClick={() => setIsOpenShortcutsModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                ✕ Close Guide
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: OWNER PROFILE DASHBOARD PANEL */}
      {isOpenOwnerProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transform transition-all scale-100">
            
            {/* Elegant Header with Owner Avatar Backdrop */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-650 to-indigo-900 text-white p-6 relative overflow-hidden shrink-0">
              {/* Absolutes decorative logo */}
              <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none">
                <Store className="w-32 h-32" />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                {/* Visual Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-indigo-950 font-black text-2xl flex items-center justify-center shadow-lg border border-white/40 uppercase tracking-widest shrink-0 animate-pulse">
                  {profileOwnerName ? profileOwnerName.substring(0, 2).toUpperCase() : 'ME'}
                </div>
                <div>
                  <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Owner Account Profile (मालिक प्रोफ़ाइल)
                  </span>
                  <h3 className="text-xl font-black tracking-tight mt-1 truncate">{profileOwnerName || 'Dear business partner'}</h3>
                  <p className="text-xs text-indigo-200 font-semibold mt-0.5 truncate flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-indigo-300" />
                    Managing: <span className="font-extrabold text-white">{profileShopName || activeShop.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Context */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Quick statistics layout for the selected store */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Store Products</p>
                  <p className="text-base font-black font-mono text-slate-800">{activeProds.length} <span className="text-xs text-slate-500 font-semibold font-sans">items</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Khaata Customers</p>
                  <p className="text-base font-black font-mono text-indigo-700">{activeUdhaars.length} <span className="text-xs text-slate-500 font-semibold font-sans font-sans">accounts</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Accumulated Sales Value</p>
                  <p className="text-base font-black font-mono text-emerald-800">₹{activeSales.reduce((acc, current) => acc + current.amount, 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Shop Location Area</p>
                  <p className="text-xs font-black text-slate-800 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {profileLocation || activeShop.location}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-black uppercase text-indigo-950 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Edit Profile Information / जानकारी बदलें
                </h4>

                {/* Owner Name */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Full Name of Business Owner (मालिक का नाम) <span className="text-rose-505 font-extrabold text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={50}
                    value={profileOwnerName}
                    onChange={(e) => setProfileOwnerName(e.target.value)}
                    placeholder="Enter business partner full name..."
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-800"
                  />
                </div>

                {/* Shop Name */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Dukaan / Registered Shop Name (दुकान का नाम) <span className="text-rose-505 font-extrabold text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={80}
                    value={profileShopName}
                    onChange={(e) => setProfileShopName(e.target.value)}
                    placeholder="Enter your store/business brand name as displays on invoices..."
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-800"
                  />
                </div>

                {/* Phone & Location Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                      Business Phone / व्हाट्सएप (Phone)
                    </label>
                    <input 
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value.replace(/[^0-9+]/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-800"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                      City/Location State (शहर/राज्य)
                    </label>
                    <input 
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      placeholder="e.g. Mumbai, MH"
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-800"
                    />
                  </div>
                </div>

                {/* Operations Style Selector dropdown */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    Management Working Style (कार्य शैली)
                  </label>
                  <select 
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value as 'manual' | 'digital')}
                    className="w-full text-xs font-bold px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-indigo-600 focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="manual">📕 Manual Book Ledger Mode (मैन्युअल बही खाता पद्धति)</option>
                    <option value="digital">💻 Digital Importer Spreadsheet Mode (डिजिटल आयात और स्कैनिंग)</option>
                  </select>
                </div>
              </div>

              {/* Share Shop Details text template card */}
              <div className="bg-indigo-50/40 border border-indigo-150 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-700 block tracking-wider">📋 Share Credentials (मालिक और दुकान की जानकारी कॉपी करें)</span>
                <p className="text-[11px] font-semibold text-slate-600 leading-snug">
                  Quickly copy formatted card details to send to teammates or staff members over chat forums.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const shareText = `*Dukaan Saathi Shop Profile*\n🏪 Shop Name: ${profileShopName}\n👤 Owner: ${profileOwnerName}\n📞 Contact: ${profilePhone}\n📍 Location: ${profileLocation}\n📚 Management: ${profileType === 'manual' ? 'Manual Book entries' : 'Digital Importer'}`;
                    navigator.clipboard.writeText(shareText);
                    triggerToast("Template copied to clipboard!");
                  }}
                  className="w-full py-2 bg-white text-indigo-700 hover:bg-slate-55 rounded-xl border border-indigo-200 text-xs font-bold transition-all hover:shadow-xs active:scale-95 cursor-pointer"
                >
                  📄 Copy Business Card Information
                </button>
              </div>

            </div>

            {/* Save Profile Controls inside footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsOpenOwnerProfileModal(false)}
                className="text-xs uppercase font-black text-slate-500 tracking-wide hover:text-slate-800 transition-colors cursor-pointer"
              >
                ✕ Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveProfile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>Save Changes / सुरक्षित करें</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
