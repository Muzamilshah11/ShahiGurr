import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Shield, Truck, Phone, MessageCircle, MapPin, Search } from 'lucide-react';

export const Footer: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { settings, setIsTrackingOpen, setIsAdminOpen } = useStore();

  const brandName = isUrdu ? (settings?.urduStoreName || 'شاہی گُڑ کمپنی') : (settings?.storeName || 'Shahi Gurr Co.');

  return (
    <footer className="bg-[#1C120B] text-[#FAF7F2] pt-16 pb-24 lg:pb-16 border-t border-[#382315]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#2E1E12]">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <h3
              className={`text-2xl font-bold tracking-tight text-white ${
                isUrdu ? 'font-urdu font-bold text-2xl' : 'font-serif-brand'
              }`}
            >
              {brandName}
            </h3>
            <p className={`text-sm text-[#B8A392] leading-relaxed max-w-sm ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
              {isUrdu
                ? `${brandName} روایتی دیسی مٹھاس، خالص گنے کے رس اور معیاری خشک میوہ جات کا منفرد امتزاج پیش کرتا ہے۔ پورے پاکستان میں محفوظ ڈیلیوری۔`
                : 'Preserving the rustic culinary heritage of Pakistan. Pure unrefined sugarcane jaggery prepared in authentic wood-fired cauldrons.'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#D4A373]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'ملک گیر ڈیلیوری' : 'Nationwide Delivery'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'کیش آن ڈیلیوری' : 'Cash on Delivery'}</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className={`text-sm font-bold text-[#D4A373] uppercase tracking-wider ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'فوری لنکس' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-sm text-[#B8A392]">
              <li>
                <a href="#benefits" className="hover:text-white transition-colors">{t('benefits')}</a>
              </li>
              <li>
                <a href="#variants" className="hover:text-white transition-colors">{t('variants')}</a>
              </li>
              <li>
                <a href="#ingredients" className="hover:text-white transition-colors">{t('ingredients')}</a>
              </li>
              <li>
                <a href="#serving" className="hover:text-white transition-colors">{t('serving')}</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">{t('reviews')}</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">{t('faq')}</a>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className={`text-sm font-bold text-[#D4A373] uppercase tracking-wider ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'رابطہ اور سپورٹ' : 'Customer Care'}
            </h4>
            <div className="space-y-2 text-sm text-[#B8A392]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>+{settings?.whatsappNumber || '923001234567'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>WhatsApp: +{settings?.whatsappNumber || '923001234567'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'پشاور اور لاہور، پاکستان' : 'Peshawar & Lahore Hubs, Pakistan'}</span>
              </div>
            </div>

            {/* Quick Track Order Link */}
            <div className="pt-3">
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#24140D] bg-[#D4A373] hover:bg-[#C49363] rounded-lg transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className={isUrdu ? 'font-urdu' : ''}>{t('trackOrder')}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Payments, Copyright & Admin link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7565]">
          <p className={isUrdu ? 'font-urdu' : ''}>
            © {new Date().getFullYear()} {brandName}. {isUrdu ? 'جملہ حقوق محفوظ ہیں۔' : 'All rights reserved.'}
          </p>

          {/* Payment Methods Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#D4C3B3]">
            <span className="bg-[#2C1E14] px-2 py-1 rounded border border-[#3E291B]">Cash on Delivery</span>
            <span className="bg-[#2C1E14] px-2 py-1 rounded border border-[#3E291B]">JazzCash</span>
            <span className="bg-[#2C1E14] px-2 py-1 rounded border border-[#3E291B]">Easypaisa</span>
            <span className="bg-[#2C1E14] px-2 py-1 rounded border border-[#3E291B]">Raast / Bank</span>
          </div>

          {/* Discreet Admin Portal Link */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="text-[#8A7565] hover:text-[#D4A373] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
