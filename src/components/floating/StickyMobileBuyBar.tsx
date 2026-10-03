import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatPKR, formatPKRUrdu } from '../../utils/formatters';
import { ShoppingBag } from 'lucide-react';

export const StickyMobileBuyBar: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { selectedVariant, quantity, openCheckoutWithVariant, variants, setSelectedVariant } = useStore();

  const total = (selectedVariant?.price || 1199) * quantity;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D9C8B5] p-2.5 shadow-2xl">
      <div className="flex items-center justify-between gap-2">
        {/* Variant Selector / Info */}
        <div className="flex-1 min-w-0">
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const found = variants.find((v) => v.id === e.target.value);
              if (found) setSelectedVariant(found);
            }}
            className="w-full bg-[#EFE7DC] border border-[#D9C8B5] rounded-lg px-2 py-1 text-xs font-semibold text-[#24140D] truncate focus:outline-none"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {isUrdu ? (v.urduName || v.name) : v.name} - {formatPKR(v.price)}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-[#6B503D] mt-0.5 truncate flex items-center gap-1.5">
            <span className="font-bold text-[#24140D] tabular-nums">
              {isUrdu ? formatPKRUrdu(total) : formatPKR(total)}
            </span>
            <span>({quantity}x)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => openCheckoutWithVariant(selectedVariant || undefined, quantity)}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#8F5E2B] active:bg-[#73481E] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className={isUrdu ? 'font-urdu text-xs' : ''}>{t('orderNow')}</span>
        </button>
      </div>
    </div>
  );
};
