import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Flame, Layers, Leaf, Sun, ShieldCheck } from 'lucide-react';

export const IngredientsSection: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { ingredients } = useStore();

  const getIngredientIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-[#8F5E2B]" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-[#8F5E2B]" />;
      case 'Leaf':
        return <Leaf className="w-6 h-6 text-[#8F5E2B]" />;
      case 'Sun':
        return <Sun className="w-6 h-6 text-[#8F5E2B]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#8F5E2B]" />;
    }
  };

  return (
    <section id="ingredients" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DCcb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'قدرتی و خالص اجزاء' : 'Natural Ingredients'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'روایتی گُڑ معیاری میوہ جات اور بیجوں کے ساتھ' : 'Traditional Gurr With Premium Nuts & Seeds'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base text-[#6B503D] ${isUrdu ? 'font-urdu leading-[2]' : ''}`}>
            {isUrdu
              ? 'ہر جزو کو خاص طور پر چنا گیا ہے تاکہ ذائقہ، کرکرا پن اور قدرتی افادیت برقرار رہے۔'
              : 'Every single component is freshly sourced, roasted, and blended for the ultimate crunch.'}
          </p>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ing, idx) => {
            const name = isUrdu ? ing.urduName : ing.name;
            const desc = isUrdu ? ing.urduDescription : ing.description;

            return (
              <div
                key={ing.id || idx}
                className="bg-[#F7F1E7] border border-[#E4D7C7] rounded-2xl p-6 transition-all hover:bg-[#EFE5D7] hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#D9C8B5] flex items-center justify-center shrink-0 shadow-sm">
                    {getIngredientIcon(ing.iconName)}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold text-[#24140D] mb-1 ${isUrdu ? 'font-urdu font-bold text-base' : 'font-serif-brand'}`}>
                      {name}
                    </h3>
                    <p className={`text-xs sm:text-sm text-[#5A3E2B] leading-relaxed ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust disclaimer note */}
        <div className="mt-10 bg-[#EFE7DC] border border-[#D9C8B5] rounded-xl p-4 text-center max-w-2xl mx-auto">
          <p className={`text-xs text-[#5A3E2B] flex items-center justify-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
            <ShieldCheck className="w-4 h-4 text-[#8F5E2B] shrink-0" />
            <span>
              {isUrdu
                ? 'تمام اجزاء کو حفظان صحت کے اصولوں کے مطابق صاف اور محفوظ طریقے سے تیار کیا جاتا ہے۔'
                : '100% Food-grade standard processing with strict hygiene and clean handling.'}
            </span>
          </p>
        </div>

      </div>
    </section>
  );
};
