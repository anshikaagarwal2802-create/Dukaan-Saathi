/**
 * Dukaan Saathi TypeScript Types and Interfaces
 */

export type LanguageCode = string;

export interface TranslationSet {
  appName: string;
  tagline: string;
  selectLanguage: string;
  shopSetup: string;
  shopNameLabel: string;
  ownerNameLabel: string;
  phoneLabel: string;
  locationLabel: string;
  shopTypeManual: string;
  shopTypeManualDesc: string;
  shopTypeDigital: string;
  shopTypeDigitalDesc: string;
  startBtn: string;
  dashboard: string;
  inventory: string;
  khaata: string;
  newBilling: string;
  barcodeScan: string;
  todaySales: string;
  netProfit: string;
  totalUdhaar: string;
  paymentMode: string;
  margin: string;
  customAlerts: string;
  sevenDaysSales: string;
  downloadPdf: string;
  downloadSuccess: string;
  prodAnalysis: string;
  addProductsExcel: string;
  recentUdhaar: string;
  viewAll: string;
  reminderBtn: string;
  remindedStatus: string;
  collectionSchedule: string;
  aiTipsTitle: string;
  aiTipsSubtitle: string;
  generateNewTips: string;
  generatingTips: string;
  productName: string;
  buyPrice: string;
  sellPrice: string;
  sold: string;
  unit: string;
  stock: string;
  profit: string;
  loss: string;
  actions: string;
  save: string;
  cancel: string;
  addSingleProduct: string;
  uploadBillingFile: string;
  dragDropText: string;
  orText: string;
  browseFiles: string;
  notNecessaryStack: string;
  whatsappReminderText: string;
  sendWhatsappMsg: string;
  previewMessage: string;
  settings: string;
  multiShop: string;
  activeShop: string;
  addShop: string;
  whatsAppReminderSent: string;
  barcodeModalTitle: string;
  scanSimulatorPlaceholder: string;
  scanNowBtn: string;
  itemFound: string;
  itemNotFound: string;
  addNewItemText: string;
  errorLoadingTips: string;
  overdue: string;
  pending: string;
  cashLabel: string;
  upiLabel: string;
  dailyStreak: string;
  bestSalesDay: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  location: string;
  type: 'manual' | 'digital';
}

export interface Product {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  stock: number;
  soldQuantity: number;
  barcode?: string;
  category?: string;
}

export interface UdhaarRecord {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  date: string;
  bills: string[]; // bill numbers
  daysAgo: number;
  status: 'pending' | 'settled';
  history: { date: string; amountPaid: number; remark: string }[];
}

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: 'rent' | 'salary' | 'electricity' | 'supplier' | 'other';
  date: string;
}

export interface SalesRecord {
  id: string;
  amount: number;
  date: string;
  profit: number;
  paymentMode: 'cash' | 'upi';
  itemsCount: number;
}

export interface AITip {
  id: string;
  text: string;
  type: 'maggi-margin' | 'friday-butter' | 'udhaar-alert' | 'generic-info' | 'overhead' | 'margin' | 'alert' | 'success' | 'info' | 'onboarding';
  isAIPerformed?: boolean;
}
