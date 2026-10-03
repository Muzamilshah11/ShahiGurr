import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Truck, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { settings } = useStore();

  const deliveryText = isUrdu
    ? (settings?.urduDeliveryText || 'پورے پاکستان میں تیز رفتار ڈیلیوری اور کیش آن ڈیلیوری کی سہولت')
    : (settings?.deliveryText || 'Express Nationwide Delivery Across Pakistan • Cash on Delivery (COD) Available');

  return (
    <div className="bg-[#24140D] text-[#FAF7F2] text-xs font-medium py-2 px-4 border-b border-[#3D2619]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap truncate mx-auto text-center sm:mx-0">
          <Truck className="w-3.5 h-3.5 text-[#D4A373] shrink-0 inline" />
          <span className={`${isUrdu ? 'font-urdu text-xs leading-normal' : ''}`}>{deliveryText}</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[#D4A373] text-xs shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{isUrdu ? '100% محفوظ خریداری' : '100% Guaranteed Fresh'}</span>
          </span>
          <span className="text-[#5C4033]">|</span>
          <span>{isUrdu ? 'واٹس ایپ ہیلپ لائن: ' : 'WhatsApp: '} +{settings?.whatsappNumber || '923001234567'}</span>
        </div>
      </div>
    </div>
  );
};
