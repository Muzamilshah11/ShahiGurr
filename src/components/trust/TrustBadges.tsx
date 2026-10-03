import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Truck, RefreshCw, Award, Lock, Sparkles } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const { isUrdu } = useLanguage();

  const badges = [
    {
      icon: Award,
      titleEn: 'Premium Quality',
      titleUr: 'بہترین معیار',
      descEn: 'Authentic desi taste with whole cashews',
      descUr: 'ثابت کاجو اور اصلی دیسی مٹھاس',
    },
    {
      icon: ShieldCheck,
      titleEn: 'Hygienically Packed',
      titleUr: 'صاف ستھری پیکنگ',
      descEn: 'Food-grade moisture-proof zip pouches',
      descUr: 'نمی سے محفوظ زپ لاک بیریئر پاؤچ',
    },
    {
      icon: Truck,
      titleEn: 'Cash on Delivery',
      titleUr: 'کیش آن ڈیلیوری',
      descEn: 'Pay at your doorstep anywhere in Pakistan',
      descUr: 'پارسل موصول ہونے پر تسلی سے ادائیگی',
    },
    {
      icon: Sparkles,
      titleEn: 'Small Batch Harvest',
      titleUr: 'تازہ تیار کردہ بیج',
      descEn: 'Slow boiled over natural wood fire',
      descUr: 'لکڑی کی قدرتی آگ پر روایتی تیاری',
    },
  ];

  return (
    <section className="py-12 bg-[#FAF7F2] border-b border-[#E8DCcb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EFE7DC] text-[#8F5E2B] flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className={`text-sm sm:text-base font-bold text-[#24140D] mb-1 ${isUrdu ? 'font-urdu font-bold text-sm' : 'font-serif-brand'}`}>
                  {isUrdu ? b.titleUr : b.titleEn}
                </h4>
                <p className={`text-xs text-[#6B503D] max-w-xs ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? b.descUr : b.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
