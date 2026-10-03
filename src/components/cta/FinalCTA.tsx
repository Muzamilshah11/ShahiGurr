import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Truck, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { openCheckoutWithVariant, settings, selectedVariant } = useStore();

  const handleWhatsApp = () => {
    const phone = settings?.whatsappNumber || '923001234567';
    const msg = isUrdu ? 'السلام علیکم، مجھے خالص دیسی گُڑ آرڈر کرنا ہے' : 'Assalam-o-Alaikum, I would like to order fresh Pakistani Gurr';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#2C1E14] to-[#1F140D] text-white relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8F5E2B]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4A373] bg-[#3D2619] border border-[#5C3D2B] px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span className={isUrdu ? 'font-urdu' : 'uppercase tracking-wider'}>
            {isUrdu ? 'تازہ اسٹاک محدود ہے' : 'Fresh Rural Harvest • Ready to Dispatch'}
          </span>
        </div>

        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight max-w-3xl mx-auto ${
            isUrdu ? 'font-urdu font-bold leading-[1.8] text-3xl sm:text-4xl lg:text-5xl' : 'font-serif-brand'
          }`}
        >
          {isUrdu
            ? 'اپنے گھر لائیں روایتی دیسی گُڑ کی قدرتی مٹھاس اور خوشبو'
            : 'Bring Home The Authentic Sweetness Of Pakistan’s Heritage'}
        </h2>

        <p className={`text-base sm:text-lg text-[#D4C3B3] max-w-2xl mx-auto leading-relaxed ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
          {isUrdu
            ? 'بغیر کسی کیمیکل، بھنے ہوئے کاجو، ناریل اور سونف کے ساتھ۔ پورے پاکستان میں کیش آن ڈیلیوری کی سہولت۔'
            : 'Pure sugarcane molasses loaded with crunchy roasted cashews, sesame, and coconut. Delivered fresh across Pakistan with Cash on Delivery.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => openCheckoutWithVariant(selectedVariant || undefined)}
            className="w-full sm:w-auto px-10 py-4 text-base font-semibold text-[#24140D] bg-[#D4A373] hover:bg-[#C49363] active:scale-98 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className={isUrdu ? 'font-urdu text-base font-bold' : ''}>
              {isUrdu ? 'اپنا گُڑ ابھی آرڈر کریں' : 'Order Your Gurr Now'}
            </span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full sm:w-auto px-8 py-4 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'واٹس ایپ پر رابطہ' : 'WhatsApp Us'}</span>
          </button>
        </div>

        {/* Trust summary strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#D4C3B3]">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#D4A373]" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? '2 سے 4 دن میں ڈیلیوری' : 'Express Nationwide Shipping'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'کیش آن ڈیلیوری' : 'Cash on Delivery'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? '100% خالص قدرتی رس' : 'Unrefined Natural Molasses'}</span>
          </span>
        </div>

      </div>
    </section>
  );
};
