import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import {
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Coffee,
  Truck,
  Award,
  Flame,
  Leaf,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Coffee,
  Truck,
  Award,
  Flame,
  Leaf,
};

export const BenefitsSection: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { benefits } = useStore();

  return (
    <section id="benefits" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DCcb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'اعلیٰ قدرتی خصوصیات' : 'Artisanal Standards'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'ہمارے گُڑ کی بے مثال خصوصیات' : 'Handcrafted Desi Goodness In Every Bite'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base text-[#6B503D] ${isUrdu ? 'font-urdu leading-[2]' : ''}`}>
            {isUrdu
              ? 'خالص گنے کے قدرتی رس اور بھنے ہوئے خشک میوہ جات سے تیار کردہ اصلی دیسی گُڑ'
              : 'Traditional recipe passed through generations, made with pure unrefined cane extract and roasted dry fruits.'}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = iconMap[benefit.iconName] || Sparkles;
            const title = isUrdu ? benefit.urduTitle : benefit.title;
            const desc = isUrdu ? benefit.urduDescription : benefit.description;

            return (
              <div
                key={benefit.id || idx}
                className="bg-[#F6EFE5] hover:bg-[#EFE5D7] border border-[#E2D4C3] rounded-2xl p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8F5E2B]/10 text-[#8F5E2B] flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>

                <h3
                  className={`text-lg font-bold text-[#24140D] mb-2 ${
                    isUrdu ? 'font-urdu font-bold text-lg leading-normal' : 'font-serif-brand'
                  }`}
                >
                  {title}
                </h3>

                <p className={`text-sm text-[#5A3E2B] leading-relaxed ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
                  {desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
