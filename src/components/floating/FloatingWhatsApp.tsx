import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { settings, selectedVariant } = useStore();

  const handleWhatsAppClick = () => {
    const phone = settings?.whatsappNumber || '923001234567';
    const message = isUrdu
      ? `السلام علیکم! مجھے ${settings?.urduProductName || 'پریمیم گُڑ'} (${selectedVariant?.urduName || selectedVariant?.name || '1 کلو'}) کے بارے میں معلومات اور آرڈر درکار ہے۔`
      : `Assalam-o-Alaikum, I want to order ${settings?.productName || 'Premium Natural Gurr'} (${selectedVariant?.name || '1kg'}).`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 flex items-center gap-2"
    >
      <button
        onClick={handleWhatsAppClick}
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current text-white shrink-0" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'واٹس ایپ پر رابطہ' : 'Order on WhatsApp'}</span>
        </span>
      </button>
    </aside>
  );
};
