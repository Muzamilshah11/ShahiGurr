import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

export const WhyOurGurr: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { openCheckoutWithVariant } = useStore();

  const comparisonPoints = [
    {
      featureEn: 'Sugarcane Source',
      featureUr: 'گنے کا رس',
      ourEn: 'Freshly harvested unrefined natural cane juice',
      ourUr: 'صبح کا تازہ قدرتی رس بغیر کسی ملاوٹ کے',
      marketEn: 'Refined sugar by-products or stale storage',
      marketUr: 'پرانا اسٹاک یا چینی کا فضلہ',
    },
    {
      featureEn: 'Nuts & Dry Fruits',
      featureUr: 'خشک میوہ جات',
      ourEn: 'Generous roasted cashews, peanuts, coconut & fennel in every bite',
      ourUr: 'بھرپور بھنے ہوئے کاجو، مونگ پھلی، گری اور سونف',
      marketEn: 'Scanty nuts or only sesame dust on top',
      marketUr: 'صرف اوپر برائے نام تل یا کم مقدار',
    },
    {
      featureEn: 'Chemical Bleaching',
      featureUr: 'کیمیکل یا رنگ کی ملاوٹ',
      ourEn: 'Zero artificial bleaching agents, authentic golden caramel',
      ourUr: 'بالکل کیمیکل فری، اصلی گولڈن براؤن رنگت',
      marketEn: 'Chemically bleached with hydrosulphite for bright yellow fake look',
      marketUr: 'ہائیڈرو سلفائٹ اور مصنوئی پاؤڈر سے چمکایا گیا',
    },
    {
      featureEn: 'Packaging & Shelf Life',
      featureUr: 'پیکنگ اور محفوظیت',
      ourEn: 'Airtight multi-layer zip barrier pouch with silica seal',
      ourUr: 'نمی سے محفوظ ملٹی لیئر زپ لاک پاؤچ',
      marketEn: 'Loose open wrapping causing sogginess and moisture absorption',
      marketUr: 'کھلی پولی تھین جس سے گُڑ پگھل جاتا ہے',
    },
    {
      featureEn: 'Delivery & Reliability',
      featureUr: 'ڈیلیوری اور سہولت',
      ourEn: 'Nationwide Cash on Delivery with full tracking & support',
      ourUr: 'پورے پاکستان میں لائیو ٹریکنگ کے ساتھ کیش آن ڈیلیوری',
      marketEn: 'Uncertain delivery and lack of customer support',
      marketUr: 'غیر یقینی ڈیلیوری اور رابطے کا فقدان',
    },
  ];

  return (
    <section id="why-us" className="py-16 sm:py-20 bg-[#F4EDE1] border-b border-[#E0D1BF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'فرق خود جانیے' : 'The Authentic Standard'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'ہمارا گُڑ مارکیٹ کے عام گُڑ سے کیوں بہتر ہے؟' : 'Why Choose Our Premium Natural Gurr?'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base text-[#6B503D] ${isUrdu ? 'font-urdu leading-[2]' : ''}`}>
            {isUrdu
              ? 'معیار، ذائقے اور صفائی میں کوئی سمجھوتہ نہیں۔ ایک نظر میں فرق دیکھیے۔'
              : 'A side-by-side look at the difference true village craftsmanship and food-grade standards make.'}
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl overflow-hidden shadow-md">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 bg-[#24140D] text-white py-4 px-6 text-xs font-bold uppercase tracking-wider">
            <div className="col-span-3">{isUrdu ? 'خصوصیت' : 'Standard'}</div>
            <div className="col-span-5 text-[#D4A373] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUrdu ? 'ہمارا پریمیم گُڑ (خیبر گُڑ)' : 'Our Premium Gurr'}</span>
            </div>
            <div className="col-span-4 text-stone-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>{isUrdu ? 'مارکیٹ کا عام سستا گُڑ' : 'Ordinary Market Gurr'}</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#EADFCF]">
            {comparisonPoints.map((point, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 p-5 sm:p-6 gap-3 md:gap-4 items-center hover:bg-[#F9F5EE] transition-colors"
              >
                {/* Feature Label */}
                <div className="md:col-span-3">
                  <span className={`text-sm font-bold text-[#24140D] block ${isUrdu ? 'font-urdu text-sm' : 'font-serif-brand'}`}>
                    {isUrdu ? point.featureUr : point.featureEn}
                  </span>
                </div>

                {/* Our Gurr Advantage */}
                <div className="md:col-span-5 flex items-start gap-2 bg-[#EAF5EC] md:bg-transparent p-3 md:p-0 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                  <span className={`text-xs sm:text-sm font-medium text-[#1E4D2B] md:text-[#24140D] ${isUrdu ? 'font-urdu leading-relaxed' : ''}`}>
                    {isUrdu ? point.ourUr : point.ourEn}
                  </span>
                </div>

                {/* Ordinary Competitor */}
                <div className="md:col-span-4 flex items-start gap-2 text-stone-500 bg-[#F4EDE1] md:bg-transparent p-3 md:p-0 rounded-xl text-xs">
                  <XCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span className={isUrdu ? 'font-urdu leading-relaxed' : ''}>
                    {isUrdu ? point.marketUr : point.marketEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 text-center">
          <button
            onClick={() => openCheckoutWithVariant()}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm sm:text-base font-semibold text-white bg-[#8F5E2B] hover:bg-[#73481E] active:scale-98 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className={isUrdu ? 'font-urdu text-base' : ''}>
              {isUrdu ? 'ابھی اصلی گُڑ آرڈر کریں' : 'Taste The Authentic Difference Today'}
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};
