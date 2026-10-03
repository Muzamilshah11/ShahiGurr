import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isUrdu: boolean;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    home: 'Home',
    benefits: 'Benefits',
    variants: 'Sizes & Pricing',
    ingredients: 'Ingredients',
    gallery: 'Gallery',
    whyUs: 'Why Our Gurr',
    serving: 'How to Enjoy',
    nutrition: 'Nutrition',
    reviews: 'Customer Reviews',
    faq: 'FAQ',
    orderNow: 'Order Now',
    trackOrder: 'Track Order',
    adminLogin: 'Admin Portal',
    freeDelivery: 'Free Nationwide Delivery on orders over Rs. 2,000',
    cashOnDelivery: 'Cash on Delivery Available Across Pakistan',
    rs: 'Rs.',
    pkr: 'PKR',
    save: 'Save',
    off: 'OFF',
    inStock: 'In Stock - Fresh Batch',
    limitedStock: 'Limited Batch Available',
    qty: 'Quantity',
    subtotal: 'Subtotal',
    delivery: 'Delivery Charges',
    free: 'FREE',
    grandTotal: 'Grand Total',
    choosePack: 'Choose Your Pack',
    viewAllReviews: 'Read All Reviews',
    writeReview: 'Write a Review',
    orderConfirmation: 'Order Confirmed',
    orderId: 'Order ID',
    customerDetails: 'Customer Details',
    paymentMethod: 'Payment Method',
    deliveryAddress: 'Delivery Address',
    downloadReceipt: 'Download Receipt (PNG)',
    shareWhatsapp: 'Share via WhatsApp',
    close: 'Close',
    backToStore: 'Back to Store',
  },
  ur: {
    // Nav & Common
    home: 'ہوم',
    benefits: 'خصوصیات',
    variants: 'پیکنگ اور قیمت',
    ingredients: 'قدرتی اجزاء',
    gallery: 'تصاویر',
    whyUs: 'ہمارا گُڑ ہی کیوں؟',
    serving: 'استعمال کے طریقے',
    nutrition: 'غذائی معلومات',
    reviews: 'خریداروں کی رائے',
    faq: 'اکثر پوچھے گئے سوالات',
    orderNow: 'ابھی آرڈر کریں',
    trackOrder: 'آرڈر ٹریک کریں',
    adminLogin: 'ایڈمن پورٹل',
    freeDelivery: '2000 روپے سے زائد کے آرڈر پر پورے پاکستان میں مفت ڈیلیوری',
    cashOnDelivery: 'پورے پاکستان میں کیش آن ڈیلیوری کی سہولت دستیاب ہے',
    rs: 'روپے',
    pkr: 'روپے',
    save: 'بچت',
    off: 'رعایت',
    inStock: 'اسٹاک میں موجود — تازہ تیار شدہ',
    limitedStock: 'محدود تازہ اسٹاک',
    qty: 'تعداد',
    subtotal: 'کل رقم',
    delivery: 'ڈیلیوری چارجز',
    free: 'مفت',
    grandTotal: 'ٹوٹل واجب الادا رقم',
    choosePack: 'اپنا پسندیدہ پیک منتخب کریں',
    viewAllReviews: 'تمام کمنٹس دیکھیں',
    writeReview: 'اپنی رائے درج کریں',
    orderConfirmation: 'مبارک ہو! آرڈر بک ہو گیا',
    orderId: 'آرڈر نمبر',
    customerDetails: 'کسٹمر کی تفصیلات',
    paymentMethod: 'طریقہ ادائیگی',
    deliveryAddress: 'ڈیلیوری ایڈریس',
    downloadReceipt: 'رسید ڈاؤن لوڈ کریں (تصویر)',
    shareWhatsapp: 'واٹس ایپ پر بھیجیں',
    close: 'بند کریں',
    backToStore: 'دوبارہ شاپنگ کریں',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('khyber_gurr_lang');
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('khyber_gurr_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string, defaultText?: string) => {
    return translations[language][key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isUrdu: language === 'ur',
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
