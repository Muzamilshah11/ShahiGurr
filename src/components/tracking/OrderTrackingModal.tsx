import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { formatPKR, formatPKRUrdu } from '../../utils/formatters';
import { downloadReceiptPng } from '../../utils/receiptGenerator';
import {
  Search,
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { isTrackingOpen, setIsTrackingOpen, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isTrackingOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.orders?.length > 0) {
        setOrders(data.orders);
      } else {
        setErrorMsg(
          data.error ||
            (isUrdu
              ? 'اس آرڈر نمبر یا فون سے متعلق کوئی آرڈر نہیں ملا۔ براہ کرم تفصیلات دوبارہ چیک کریں۔'
              : 'No orders found matching this query. Please verify your Order ID or phone number.')
        );
      }
    } catch {
      setErrorMsg('Failed to connect to tracking system. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'dispatched':
      case 'on the way':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { key: 'pending', en: 'Pending', ur: 'زیرِ جائزہ (Pending)' },
    { key: 'confirmed', en: 'Confirmed', ur: 'تصدیق شدہ (Confirmed)' },
    { key: 'dispatched', en: 'Dispatched', ur: 'روانہ ہو گیا (Dispatched)' },
    { key: 'delivered', en: 'Delivered', ur: 'ڈیلیور ہو گیا (Delivered)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#24140D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#3D2619]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8F5E2B] flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-bold ${isUrdu ? 'font-urdu font-bold text-lg' : 'font-serif-brand'}`}>
                {isUrdu ? 'پارسل و آرڈر لائیو ٹریکنگ' : 'Live Order Tracking'}
              </h3>
              <p className="text-xs text-[#D4A373]">
                {isUrdu ? 'اپنا آرڈر نمبر یا موبائل نمبر درج کریں' : 'Enter Order ID (e.g. ORDER-482731) or phone number'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackingOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Search Input Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C7662] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'آرڈر نمبر (مثلاً ORDER-482731) یا فون نمبر...' : 'Enter ORDER-482731, 482731 or 03001234567...'}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? (isUrdu ? 'تلاش جاری...' : 'Searching...') : (isUrdu ? 'ٹریک کریں' : 'Track')}
            </button>
          </form>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className={isUrdu ? 'font-urdu' : ''}>{errorMsg}</p>
            </div>
          )}

          {/* Tracking Results */}
          {orders && orders.map((order) => {
            const currentStepIdx = getStepIndex(order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-white border border-[#D9C8B5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6"
              >
                {/* Order Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DCcb] gap-3">
                  <div>
                    <span className="text-xs text-[#8F5E2B] font-bold font-mono uppercase block">
                      {order.orderId}
                    </span>
                    <h4 className={`text-base font-bold text-[#24140D] ${isUrdu ? 'font-urdu' : 'font-serif-brand'}`}>
                      {order.variantName} ({order.quantity}x)
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#24140D] bg-[#F4EDE1] px-3 py-1 rounded-lg">
                      {formatPKR(order.total)}
                    </span>
                    <button
                      onClick={() => downloadReceiptPng(order, settings)}
                      className="p-2 text-[#8F5E2B] hover:bg-[#F4EDE1] border border-[#D9C8B5] rounded-lg transition-colors cursor-pointer"
                      title="Download PNG Receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4-Step Visual Progress Stepper */}
                <div>
                  <h5 className={`text-xs font-bold text-[#8F5E2B] uppercase tracking-wider mb-4 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'پارسل کی موجودہ صورتحال' : 'Delivery Progress'}
                  </h5>

                  <div className="relative flex items-center justify-between">
                    {/* Progress Bar Background */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#E8DCcb] -z-0" />
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#2E7D32] -z-0 transition-all duration-500"
                      style={{
                        width: `${Math.max(0, Math.min(100, (currentStepIdx / 3) * 100))}%`,
                      }}
                    />

                    {steps.map((s, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div key={s.key} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isCompleted
                                ? 'bg-[#2E7D32] text-white ring-4 ring-[#2E7D32]/20'
                                : 'bg-[#FAF7F2] border-2 border-[#D9C8B5] text-[#8C7662]'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs mt-1.5 font-bold whitespace-nowrap text-center ${
                              isCurrent
                                ? 'text-[#8F5E2B]'
                                : isCompleted
                                ? 'text-[#2E7D32]'
                                : 'text-[#8C7662]'
                            } ${isUrdu ? 'font-urdu text-[11px]' : ''}`}
                          >
                            {isUrdu ? s.ur : s.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier & Dispatch Details if available */}
                {(order.courierName || order.trackingNumber || order.dispatchNotes) && (
                  <div className="bg-[#FAF7F2] border border-[#D9C8B5] p-4 rounded-xl text-xs space-y-2">
                    <span className="font-bold text-[#8F5E2B] uppercase tracking-wider block">
                      {isUrdu ? 'کوریئر اور روانگی کی تفصیلات' : 'Courier Tracking Details'}
                    </span>
                    {order.courierName && (
                      <div className="flex justify-between">
                        <span className="text-[#8C7662]">{isUrdu ? 'کوریئر کمپنی' : 'Courier Partner'}:</span>
                        <span className="font-bold text-[#24140D]">{order.courierName}</span>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#8C7662]">{isUrdu ? 'ٹریکنگ کوڈ' : 'Tracking Number'}:</span>
                        <span className="font-mono font-bold text-[#24140D] bg-white px-2 py-0.5 rounded border border-[#D9C8B5]">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                    {order.dispatchNotes && (
                      <div className="pt-1 border-t border-[#E8DCcb] text-[#5A3E2B]">
                        <span className="font-semibold">{isUrdu ? 'نوٹ' : 'Notes'}: </span>
                        <span>{order.dispatchNotes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Timestamp History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="space-y-2">
                    <span className={`text-xs font-bold text-[#8F5E2B] uppercase tracking-wider block ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'آرڈر کی تاریخچہ' : 'Status History & Updates'}
                    </span>
                    <div className="space-y-2 text-xs">
                      {order.statusHistory.map((hist) => (
                        <div
                          key={hist.id}
                          className="flex items-start justify-between gap-4 p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E8DCcb]"
                        >
                          <div>
                            <span className="font-bold text-[#24140D] uppercase block">{hist.status}</span>
                            {hist.notes && <span className="text-[#6B503D] block">{hist.notes}</span>}
                          </div>
                          <span className="text-[#8C7662] text-[11px] shrink-0 font-mono">
                            {new Date(hist.timestamp).toLocaleString('en-PK', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};
