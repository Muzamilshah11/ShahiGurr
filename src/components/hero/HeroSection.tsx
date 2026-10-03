import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatPKR, formatPKRUrdu } from '../../utils/formatters';
import { ShoppingBag, MessageCircle, ShieldCheck, Truck, Sparkles, Check } from 'lucide-react';
import { trackPixelViewContent } from '../../utils/facebookPixel';

export const HeroSection: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { settings, product, selectedVariant, openCheckoutWithVariant } = useStore();

  const heroHeading = isUrdu
    ? (settings?.heroUrduHeading || 'خالص دیسی گُڑ — روایتی ذائقے کی مٹھاس')
    : (settings?.heroHeading || 'Pure Desi Gurr, Rich in Traditional Taste');

  const heroDesc = isUrdu
    ? (settings?.heroUrduDescription || 'خالص قدرتی گنے کے رس سے روایتی کڑاہوں میں تیار کردہ اصلی دیسی گُڑ، جس میں شامل ہیں منتخب بھنے ہوئے کاجو، خستہ گری، مونگ پھلی اور خوشبودار سونف۔')
    : (settings?.heroDescription || 'Handcrafted traditionally from pure unrefined sugarcane juice, embedded with roasted premium cashews, crunchy peanuts, and natural seeds.');

  const heroImage = product?.media?.find((m) => m.isHero)?.imageUrl || '/src/assets/images/hero_premium_gurr_1790948907151.jpg';

  const price = selectedVariant?.price || settings?.basePrice || 1199;
  const originalPrice = selectedVariant?.originalPrice || settings?.originalPrice || 1699;
  const discountPercent = selectedVariant?.discount || settings?.discountPercent || 29;

  const handleWhatsAppInquiry = () => {
    const phone = settings?.whatsappNumber || '923001234567';
    const message = isUrdu
      ? `السلام علیکم، مجھے ${settings?.urduProductName || 'پریمیم گُڑ'} (${selectedVariant?.urduName || selectedVariant?.name || '1 کلو'}) آرڈر کرنا ہے۔`
      : `Assalam-o-Alaikum, I want to order ${settings?.productName || 'Premium Natural Gurr'} (${selectedVariant?.name || '1kg'}).`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Track Meta Pixel ViewContent event
  useEffect(() => {
    if (settings?.facebookPixelId && selectedVariant) {
      trackPixelViewContent({
        content_name: `${settings?.productName || 'Shahi Gurr'} - ${selectedVariant.name}`,
        value: selectedVariant.price,
        currency: 'PKR',
        content_ids: [selectedVariant.id],
      });
    }
  }, [settings?.facebookPixelId, selectedVariant?.id]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4EDE1] to-[#FAF7F2] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E8DCcb]">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#D4A373]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (Desktop) / Main Copy & Buying Action */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Editorial Kicker Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8F5E2B] bg-[#EFE7DC] border border-[#D9C8B5] px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#8F5E2B]" />
              <span className={isUrdu ? 'font-urdu leading-normal' : 'tracking-wide uppercase'}>
                {isUrdu ? 'روایتی لکڑی کی آنچ پر تیار شدہ' : 'Artisanal Batch • 100% Traditional'}
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#24140D] leading-[1.25] text-balance ${
                isUrdu ? 'font-urdu font-bold leading-[1.9] text-3xl sm:text-4xl lg:text-5xl' : 'font-serif-brand'
              }`}
            >
              {heroHeading}
            </h1>

            {/* Sub-description */}
            <p className={`text-base sm:text-lg text-[#5A3E2B] max-w-xl mx-auto lg:mx-0 leading-relaxed ${isUrdu ? 'font-urdu text-base sm:text-lg leading-[2.1]' : ''}`}>
              {heroDesc}
            </p>

            {/* Pricing Card Section */}
            <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-2xl p-5 shadow-sm max-w-md mx-auto lg:mx-0">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#8F5E2B] uppercase tracking-wider block mb-1">
                    {selectedVariant?.name || '1kg Classic Pack'} {isUrdu && selectedVariant?.urduName ? `(${selectedVariant.urduName})` : ''}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-[#24140D] tabular-nums">
                      {isUrdu ? formatPKRUrdu(price) : formatPKR(price)}
                    </span>
                    {originalPrice > price && (
                      <span className="text-sm sm:text-base text-[#8C7662] line-through tabular-nums">
                        {isUrdu ? formatPKRUrdu(originalPrice) : formatPKR(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="bg-[#8F5E2B] text-white text-xs font-bold px-2.5 py-1 rounded-md shrink-0">
                    {discountPercent}% {t('off')}
                  </div>
                )}
              </div>

              {/* Quick Perks / Trust Points */}
              <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-[#E8DCcb] text-xs text-[#5A3E2B]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'کیش آن ڈیلیوری' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'کھانے کے لائق پیکنگ' : 'Food-Grade Zip Seal'}</span>
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
              <button
                onClick={() => openCheckoutWithVariant(selectedVariant || undefined)}
                className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-[#8F5E2B] hover:bg-[#73481E] active:scale-98 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className={isUrdu ? 'font-urdu text-base' : ''}>{isUrdu ? 'ابھی آرڈر بک کریں' : 'Order Your Gurr Now'}</span>
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-[#1F4E38] bg-[#E3F2E9] hover:bg-[#D3EADB] border border-[#B7DFC6] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span className={isUrdu ? 'font-urdu text-sm' : ''}>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
              </button>
            </div>

            {/* Trust Markers Bar */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 text-xs text-[#6B503D]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#8F5E2B]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? '2-4 دن میں ڈیلیوری' : '2-4 Days Delivery'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8F5E2B]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'تسلی بخش معیار' : '100% Quality Checked'}</span>
              </span>
            </div>

          </div>

          {/* Right Column: High-Resolution Food Photography Hero Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Product Visual Container with luxury styling */}
              <div className="relative rounded-3xl overflow-hidden border border-[#D9C8B5] shadow-2xl bg-[#EBE0D2] aspect-[4/3] group">
                <img
                  src={heroImage}
                  alt="Premium Pakistani Gurr with Cashews and Dry Fruits"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                />

                {/* Subtle gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between pointer-events-none">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#D4A373] font-semibold block">
                      {isUrdu ? 'روایتی ساخت' : 'Traditional Heritage Recipe'}
                    </span>
                    <h3 className={`text-lg font-bold text-white ${isUrdu ? 'font-urdu' : 'font-serif-brand'}`}>
                      {isUrdu ? 'خالص گُڑ، کاجو اور بادام' : 'Pure Desi Gurr with Cashews & Nuts'}
                    </h3>
                  </div>
                  <div className="bg-[#FAF7F2]/90 backdrop-blur-sm text-[#24140D] text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">
                    {isUrdu ? 'تازہ اسٹاک' : 'Fresh Harvest'}
                  </div>
                </div>
              </div>

              {/* Floating Quality Tag */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-[#24140D] text-[#FAF7F2] border border-[#8F5E2B] rounded-2xl p-3 sm:p-4 shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8F5E2B]/30 flex items-center justify-center text-[#D4A373]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider block">
                    {isUrdu ? 'روایتی کڑاہا' : 'Slow Cooked'}
                  </span>
                  <span className={`text-xs sm:text-sm font-semibold text-white block ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'اصلی گنے کا رس' : '100% Cane Molasses'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
