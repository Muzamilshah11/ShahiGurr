import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatPKR, formatPKRUrdu } from '../../utils/formatters';
import { ShoppingBag, CheckCircle2, ShieldCheck, Sparkles, Plus, Minus, Truck } from 'lucide-react';

export const VariantSelector: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const {
    variants,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    openCheckoutWithVariant,
    settings,
  } = useStore();

  const currentTotal = (selectedVariant?.price || 0) * quantity;
  const deliveryCharges = settings?.deliveryCharges || 199;

  return (
    <section id="variants" className="py-16 sm:py-20 bg-[#F4EDE1] border-b border-[#E0D1BF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'پیکنگ اور خصوصی قیمتیں' : 'Packaging & Sizing'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'اپنی پسندیدہ پیکنگ اور مقدار منتخب کریں' : 'Choose Your Desired Gurr Pack'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base text-[#6B503D] ${isUrdu ? 'font-urdu leading-[2]' : ''}`}>
            {isUrdu
              ? 'تازہ سیل بند پیکنگ، محفوظ ڈبل پاؤچ تاکہ خستہ گری اور کاجو کا کرکرا پن قائم رہے۔'
              : 'All packs are freshly packaged in airtight food-grade moisture barrier pouches.'}
          </p>
        </div>

        {/* Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {variants.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            const badge = isUrdu ? (variant.urduBadge || variant.badge) : variant.badge;
            const name = isUrdu ? (variant.urduName || variant.name) : variant.name;
            const desc = isUrdu ? (variant.urduDescription || variant.description) : variant.description;

            return (
              <div
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`relative rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-2 border-[#8F5E2B] shadow-xl scale-[1.02]'
                    : 'bg-[#FAF7F2]/80 border border-[#D9C8B5] hover:border-[#8F5E2B]/50 hover:bg-[#FAF7F2] shadow-sm'
                }`}
              >
                {/* Top Badge */}
                {badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#8F5E2B] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    <span className={isUrdu ? 'font-urdu' : ''}>{badge}</span>
                  </div>
                )}

                <div>
                  {/* Radio Selection Indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-wider">
                      {variant.weight}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#8F5E2B] bg-[#8F5E2B] text-white'
                          : 'border-[#C4B29E] bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Name */}
                  <h3
                    className={`text-lg font-bold text-[#24140D] mb-1.5 ${
                      isUrdu ? 'font-urdu font-bold text-lg' : 'font-serif-brand'
                    }`}
                  >
                    {name}
                  </h3>

                  {/* Description */}
                  {desc && (
                    <p className={`text-xs text-[#6B503D] mb-4 line-clamp-2 ${isUrdu ? 'font-urdu leading-relaxed' : ''}`}>
                      {desc}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="my-4 pt-3 border-t border-[#E8DCcb]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#24140D] tabular-nums">
                        {isUrdu ? formatPKRUrdu(variant.price) : formatPKR(variant.price)}
                      </span>
                      {variant.originalPrice > variant.price && (
                        <span className="text-xs text-[#8C7662] line-through tabular-nums">
                          {isUrdu ? formatPKRUrdu(variant.originalPrice) : formatPKR(variant.originalPrice)}
                        </span>
                      )}
                    </div>
                    {variant.discount > 0 && (
                      <span className="text-[11px] font-semibold text-[#2E7D32] block mt-0.5">
                        {isUrdu ? `${variant.discount}% بچت` : `Save ${variant.discount}% off regular price`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(variant);
                    openCheckoutWithVariant(variant, quantity);
                  }}
                  className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#8F5E2B] text-white hover:bg-[#73481E] shadow-sm'
                      : 'bg-[#EFE7DC] text-[#24140D] hover:bg-[#8F5E2B] hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className={isUrdu ? 'font-urdu' : ''}>{t('orderNow')}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Variant Summary & Quantity Bar */}
        {selectedVariant && (
          <div className="mt-12 bg-[#FAF7F2] border border-[#D9C8B5] rounded-2xl p-6 sm:p-8 shadow-md max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Variant and Quantity Control */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full md:w-auto">
                <div>
                  <span className="text-xs text-[#8F5E2B] font-bold uppercase tracking-wider block mb-0.5">
                    {isUrdu ? 'منتخب شدہ پیک' : 'Selected Pack'}
                  </span>
                  <h4 className={`text-xl font-bold text-[#24140D] ${isUrdu ? 'font-urdu' : 'font-serif-brand'}`}>
                    {isUrdu ? selectedVariant.urduName : selectedVariant.name}
                  </h4>
                  <span className="text-xs text-[#6B503D]">
                    {selectedVariant.weight} • {isUrdu ? formatPKRUrdu(selectedVariant.price) : formatPKR(selectedVariant.price)} {isUrdu ? 'فی پیک' : 'per pack'}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#D9C8B5] rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-[#5A3E2B] hover:text-[#24140D] hover:bg-[#F4EDE1] rounded-lg disabled:opacity-40 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#24140D] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-[#5A3E2B] hover:text-[#24140D] hover:bg-[#F4EDE1] rounded-lg cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total & Instant Checkout CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="text-center sm:text-right">
                  <span className="text-xs text-[#6B503D] block">{isUrdu ? 'کل رقم' : 'Item Subtotal'}</span>
                  <span className="text-2xl font-bold text-[#24140D] tabular-nums block">
                    {isUrdu ? formatPKRUrdu(currentTotal) : formatPKR(currentTotal)}
                  </span>
                  <span className="text-[11px] text-[#8F5E2B] flex items-center justify-center sm:justify-end gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isUrdu ? `ڈیلیوری: ${formatPKRUrdu(deliveryCharges)}` : `Delivery: ${formatPKR(deliveryCharges)}`}</span>
                  </span>
                </div>

                <button
                  onClick={() => openCheckoutWithVariant(selectedVariant, quantity)}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-[#8F5E2B] hover:bg-[#73481E] active:scale-98 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className={isUrdu ? 'font-urdu text-base' : ''}>{t('orderNow')}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
