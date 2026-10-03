import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { formatPKR, formatPKRUrdu } from '../../utils/formatters';
import { downloadReceiptPng } from '../../utils/receiptGenerator';
import {
  CheckCircle,
  Download,
  Share2,
  Search,
  X,
  Sparkles,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  MessageCircle,
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { completedOrder, setCompletedOrder, settings, setIsTrackingOpen } = useStore();

  useEffect(() => {
    if (completedOrder) {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8F5E2B', '#D4A373', '#2E7D32', '#F4EDE1', '#C49767'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [completedOrder]);

  if (!completedOrder) return null;

  const handleDownloadReceipt = () => {
    downloadReceiptPng(completedOrder, settings);
  };

  const handleWhatsAppShare = () => {
    const storeTitleUrdu = settings?.urduStoreName?.trim() || 'شاہی گُڑ';
    const storeTitleEn = settings?.storeName?.trim() || 'Shahi Gurr Co.';
    const text = isUrdu
      ? `*${storeTitleUrdu} آرڈر کی تصدیق*\nآرڈر نمبر: ${completedOrder.orderId}\nپیکنگ: ${completedOrder.variantName} (تعداد: ${completedOrder.quantity})\nکل رقم: ${formatPKR(completedOrder.total)}\nشہر: ${completedOrder.city}\nطریقہ ادائیگی: ${completedOrder.paymentMethod.toUpperCase()}`
      : `*${storeTitleEn} Order Confirmation*\nOrder ID: ${completedOrder.orderId}\nPack: ${completedOrder.variantName} (Qty: ${completedOrder.quantity})\nTotal: ${formatPKR(completedOrder.total)}\nCity: ${completedOrder.city}\nPayment: ${completedOrder.paymentMethod.toUpperCase()}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleTrackNow = () => {
    setCompletedOrder(null);
    setIsTrackingOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-xl w-full my-auto shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner Celebration */}
        <div className="bg-[#24140D] text-white p-6 text-center relative border-b border-[#3D2619]">
          <button
            onClick={() => setCompletedOrder(null)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#2E7D32] text-white flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-[#2E7D32]/30">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h3 className={`text-xl sm:text-2xl font-bold ${isUrdu ? 'font-urdu font-bold text-xl' : 'font-serif-brand'}`}>
            {isUrdu ? 'مبارک ہو! آپ کا آرڈر بک ہو گیا ہے' : 'Order Placed Successfully!'}
          </h3>
          <p className="text-xs text-[#D4A373] mt-1">
            {isUrdu
              ? 'ہمارا نمائندہ جلد آپ کے پارسل کی روانگی کی تصدیق کرے گا۔'
              : 'Thank you for choosing authentic handcrafted Pakistani Gurr.'}
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Order ID & Reference Tag */}
          <div className="bg-[#F4EDE1] border border-[#E0D1BF] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#8F5E2B] font-bold uppercase tracking-wider block">
              {isUrdu ? 'آپ کا آرڈر نمبر' : 'Your Order Tracking ID'}
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#24140D] tracking-wider block my-1">
              {completedOrder.orderId}
            </span>
            <span className="text-[11px] text-[#6B503D] block">
              {isUrdu ? 'اس نمبر کے ذریعے آپ پارسل کا لائیو اسٹیٹس معلوم کر سکتے ہیں۔' : 'Keep this Order ID for tracking your package delivery.'}
            </span>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-[#D9C8B5] p-3 rounded-xl">
              <span className="text-[#8C7662] block mb-0.5">{isUrdu ? 'کل ادا شدہ / واجب الادا رقم' : 'Total Amount'}:</span>
              <span className="font-bold text-[#8F5E2B] text-sm tabular-nums">{formatPKR(completedOrder.total)}</span>
            </div>

            <div className="bg-white border border-[#D9C8B5] p-3 rounded-xl">
              <span className="text-[#8C7662] block mb-0.5">{isUrdu ? 'طریقہ ادائیگی' : 'Payment Method'}:</span>
              <span className="font-bold text-[#24140D] uppercase">{completedOrder.paymentMethod}</span>
            </div>

            <div className="bg-white border border-[#D9C8B5] p-3 rounded-xl">
              <span className="text-[#8C7662] block mb-0.5">{isUrdu ? 'منزل کا شہر' : 'Destination City'}:</span>
              <span className="font-bold text-[#24140D]">{completedOrder.city}</span>
            </div>

            <div className="bg-white border border-[#D9C8B5] p-3 rounded-xl">
              <span className="text-[#8C7662] block mb-0.5">{isUrdu ? 'پیک اور مقدار' : 'Pack Selection'}:</span>
              <span className="font-bold text-[#24140D] truncate block">{completedOrder.variantName} ({completedOrder.quantity}x)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleDownloadReceipt}
              className="w-full py-3.5 bg-[#8F5E2B] hover:bg-[#73481E] active:scale-98 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t('downloadReceipt')}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="py-3 px-3 bg-[#E3F2E9] hover:bg-[#D3EADB] text-[#1F4E38] border border-[#B7DFC6] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'واٹس ایپ پر بھیجیں' : 'Share on WhatsApp'}</span>
              </button>

              <button
                onClick={handleTrackNow}
                className="py-3 px-3 bg-[#EFE7DC] hover:bg-[#E4D7C7] text-[#24140D] border border-[#D9C8B5] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#8F5E2B]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{t('trackOrder')}</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setCompletedOrder(null)}
              className="text-xs text-[#8C7662] hover:text-[#24140D] underline cursor-pointer"
            >
              {t('backToStore')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
