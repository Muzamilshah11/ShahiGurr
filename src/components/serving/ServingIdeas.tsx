import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Coffee, Utensils, Heart, Moon, Sun, Sparkles } from 'lucide-react';

export const ServingIdeas: React.FC = () => {
  const { isUrdu } = useLanguage();

  const ideas = [
    {
      icon: Coffee,
      titleEn: 'Gurr Wali Kadak Chai',
      titleUr: 'گُڑ والی کڑک چائے',
      descEn: 'Add a small piece of Gurr to brewing black tea and milk for an aromatic, velvety winter beverage.',
      descUr: 'چائے کی پتی اور دودھ کے ساتھ گُڑ کا چھوٹا ٹکڑا شامل کریں اور روایتی کشمیری و پنجابی چائے کا لطف اٹھائیں۔',
    },
    {
      icon: Moon,
      titleEn: 'Post-Meal Digestive Treat',
      titleUr: 'کھانے کے بعد ہاضمے کی میٹھی چٹکی',
      descEn: 'Enjoy a single crunchy nut-loaded bite after lunch or dinner as a natural, unrefined sweet closer.',
      descUr: 'دوپہر یا رات کے کھانے کے بعد سونف اور کاجو والا ایک ٹکڑا میٹھے کی طلب اور ہاضمے کے لیے بہترین ہے۔',
    },
    {
      icon: Utensils,
      titleEn: 'Desi Halwa, Kheer & Panjeeri',
      titleUr: 'روایتی حلوہ، کھیر اور پنجیری',
      descEn: 'Grate or melt directly into semolina halwa, desi ghee panjeeri, or rice puddings for rich caramel notes.',
      descUr: 'سوجی کے حلوے، دیسی گھی کی پنجیری اور کھیر میں چینی کے بجائے استعمال کریں اور شاندار قدرتی رنگ حاصل کریں۔',
    },
    {
      icon: Sun,
      titleEn: 'Warm Milk in Winter Evenings',
      titleUr: 'سردیوں کی شام میں گرم دودھ',
      descEn: 'Stir crushed Gurr with roasted nuts into piping hot milk with a pinch of turmeric or cardamom.',
      descUr: 'رات کو گرم دودھ میں باریک پیس کر شامل کریں؛ سردی اور تھکن دور کرنے کے لیے صدیوں پرانا دیسی نسخہ۔',
    },
  ];

  return (
    <section id="serving" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DCcb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'روایتی پکوان اور انداز' : 'Serving Inspiration'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'گُڑ کو کیسے اور کس وقت استعمال کریں؟' : 'How To Enjoy Your Premium Desi Gurr'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base text-[#6B503D] ${isUrdu ? 'font-urdu leading-[2]' : ''}`}>
            {isUrdu
              ? 'صبح کی چائے سے لے کر رات کے میٹھے تک، گُڑ کو استعمال کرنے کے شاندار اور صحت بخش طریقے۔'
              : 'From rustic morning doodh patti to comforting winter halwas, explore traditional ways to serve.'}
          </p>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ideas.map((idea, idx) => {
            const Icon = idea.icon;
            const title = isUrdu ? idea.titleUr : idea.titleEn;
            const desc = isUrdu ? idea.descUr : idea.descEn;

            return (
              <div
                key={idx}
                className="bg-[#F7F1E7] border border-[#E2D4C3] rounded-2xl p-6 transition-all hover:bg-[#EFE5D7] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#D9C8B5] text-[#8F5E2B] flex items-center justify-center mb-5 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3
                    className={`text-base font-bold text-[#24140D] mb-2 ${
                      isUrdu ? 'font-urdu font-bold text-base leading-normal' : 'font-serif-brand'
                    }`}
                  >
                    {title}
                  </h3>

                  <p className={`text-xs sm:text-sm text-[#5A3E2B] leading-relaxed ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
                    {desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#E8DCcb] flex items-center gap-1.5 text-[11px] font-semibold text-[#8F5E2B]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'روایتی نسخہ' : 'Desi Tradition'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
