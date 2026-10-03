import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Activity, Info, ShieldAlert } from 'lucide-react';

export const NutritionSection: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { nutrition } = useStore();

  const servingSize = isUrdu ? (nutrition?.urduServingSize || '100 گرام') : (nutrition?.servingSize || '100g');
  const disclaimer = isUrdu
    ? (nutrition?.urduDisclaimer || 'غذائی معلومات اجزاء اور روایتی تیاری کے طریقے کے مطابق مختلف ہو سکتی ہیں۔')
    : (nutrition?.disclaimer || 'Nutritional values may vary depending on ingredients and natural batch preparation.');

  const nutrientRows = [
    { labelEn: 'Calories', labelUr: 'کیلوریز', value: nutrition?.calories || '383 kcal' },
    { labelEn: 'Total Carbohydrates', labelUr: 'کاربوہائیڈریٹس', value: nutrition?.carbohydrates || '85g' },
    { labelEn: 'Sugars (Natural Cane Molasses)', labelUr: 'قدرتی مٹھاس', value: nutrition?.sugars || '80g' },
    { labelEn: 'Protein', labelUr: 'پروٹین', value: nutrition?.protein || '3.8g' },
    { labelEn: 'Total Fat (from Cashews & Nuts)', labelUr: 'چکنائی (میوہ جات سے)', value: nutrition?.fat || '4.2g' },
    { labelEn: 'Dietary Fiber', labelUr: 'فائبر', value: nutrition?.fiber || '1.5g' },
    { labelEn: 'Natural Iron', labelUr: 'قدرتی آئرن', value: nutrition?.iron || '11mg (61% DV)' },
    { labelEn: 'Magnesium', labelUr: 'میگنیشیم', value: nutrition?.magnesium || '70mg' },
    { labelEn: 'Potassium', labelUr: 'پوٹاشیم', value: nutrition?.potassium || '1050mg' },
  ];

  return (
    <section id="nutrition" className="py-16 sm:py-20 bg-[#F4EDE1] border-b border-[#E0D1BF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'غذائی حقائق' : 'Nutritional Facts'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'قدرتی معدنیات اور غذائیت' : 'Rich In Unrefined Minerals'}
          </h2>
          <p className={`mt-2 text-sm text-[#6B503D] ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? `فی سرونگ سائز: ${servingSize}` : `Serving Size: ${servingSize}`}
          </p>
        </div>

        {/* Nutrition Panel */}
        <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#24140D]">
            <div>
              <h3 className={`text-xl font-bold text-[#24140D] ${isUrdu ? 'font-urdu' : 'font-serif-brand'}`}>
                {isUrdu ? 'غذائی چارٹ (Nutrition Chart)' : 'Nutrition Facts'}
              </h3>
              <span className="text-xs text-[#8F5E2B]">{isUrdu ? `مقدار: ${servingSize}` : `Approx. per ${servingSize}`}</span>
            </div>
            <Activity className="w-6 h-6 text-[#8F5E2B]" />
          </div>

          <div className="divide-y divide-[#EADFCF] my-2">
            {nutrientRows.map((row, index) => (
              <div key={index} className="py-3 flex items-center justify-between text-sm">
                <span className={`text-[#4A3222] font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {isUrdu ? row.labelUr : row.labelEn}
                </span>
                <span className="text-[#24140D] font-bold tabular-nums">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Legal / Natural Variation Disclaimer */}
          <div className="mt-6 pt-4 border-t border-[#D9C8B5] flex items-start gap-3 bg-[#EFE7DC] p-4 rounded-xl text-xs text-[#5A3E2B]">
            <Info className="w-4 h-4 text-[#8F5E2B] shrink-0 mt-0.5" />
            <p className={`leading-relaxed ${isUrdu ? 'font-urdu leading-normal' : ''}`}>
              {disclaimer}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
