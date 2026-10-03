import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { CheckoutFormData, Order } from '../../types';
import { formatPKR, formatPKRUrdu } from '../../utils/formatters';
import { trackPixelPurchase } from '../../utils/facebookPixel';
import {
  X,
  ShoppingBag,
  Truck,
  CreditCard,
  Building2,
  Copy,
  Check,
  Plus,
  Minus,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Phone,
  MapPin,
  User,
  FileText,
} from 'lucide-react';

const PAKISTANI_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Mardan',
  'Sukkur',
  'Larkana',
  'Gujrat',
  'Kasur',
  'Wah Cantt',
  'Sheikhupura',
  'Jhelum',
  'Dera Ghazi Khan',
  'Swat',
  'Chiniot',
  'Other City',
];

export const CheckoutModal: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    selectedVariant,
    quantity,
    setQuantity,
    settings,
    setCompletedOrder,
  } = useStore();

  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    phone: '',
    whatsapp: '',
    city: 'Lahore',
    address: '',
    deliveryInstructions: '',
    email: '',
    paymentMethod: 'cod',
    transactionId: '',
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const unitPrice = selectedVariant?.price || 1199;
  const subtotal = unitPrice * quantity;
  const deliveryCharge = settings?.deliveryCharges !== undefined ? settings.deliveryCharges : 199;
  const grandTotal = subtotal + deliveryCharge;

  // Generate QR Code dynamically when payment method or total changes
  useEffect(() => {
    if (formData.paymentMethod === 'cod') {
      setQrDataUrl('');
      return;
    }

    let payload = '';
    if (formData.paymentMethod === 'easypaisa') {
      payload = `easypaisa://pay?receiver=${settings?.easypaisaNumber || '03001234567'}&amount=${grandTotal}&title=KhyberGurr`;
    } else if (formData.paymentMethod === 'jazzcash') {
      payload = `jazzcash://pay?receiver=${settings?.jazzcashNumber || '03001234567'}&amount=${grandTotal}&title=KhyberGurr`;
    } else {
      payload = `IBAN:${settings?.bankIban || 'PK12MEZN0001020304050607'}|AMOUNT:${grandTotal}|REF:GURR-ORDER`;
    }

    QRCode.toDataURL(payload, { width: 180, margin: 1, color: { dark: '#24140D', light: '#FFFFFF' } })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR code generation error:', err));
  }, [formData.paymentMethod, grandTotal, settings]);

  if (!isCheckoutOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'whatsapp') => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Phone validation
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError(isUrdu ? 'براہ کرم درست پاکستانی فون نمبر درج کریں (مثلاً: 03001234567)' : 'Please enter a valid Pakistani mobile number (e.g. 03001234567)');
      return;
    }

    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      setFormError(isUrdu ? 'براہ کرم اپنا پورا نام درج کریں' : 'Please enter your full name');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setFormError(isUrdu ? 'براہ کرم مکمل گھر یا دکان کا پتہ درج کریں' : 'Please provide complete delivery street address');
      return;
    }

    if (formData.paymentMethod !== 'cod' && !formData.transactionId?.trim()) {
      setFormError(isUrdu ? 'براہ کرم ادائیگی کے بعد ٹرانزیکشن آئی ڈی (TID) درج کریں' : 'Please enter the Transaction ID (TID) after making your payment');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        deliveryInstructions: formData.deliveryInstructions.trim() || null,
        email: formData.email?.trim() || null,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || 'Premium Natural Gurr 1kg',
        quantity,
        unitPrice,
        subtotal,
        deliveryCharge,
        discount: 0,
        total: grandTotal,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId?.trim() || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.order) {
        // Save in localStorage backup
        try {
          const existingBackup = JSON.parse(localStorage.getItem('store_orders_backup') || '[]');
          existingBackup.unshift(data.order);
          localStorage.setItem('store_orders_backup', JSON.stringify(existingBackup.slice(0, 20)));
        } catch {
          // ignore storage errors
        }

        setIsCheckoutOpen(false);
        setCompletedOrder(data.order);

        // Track Meta / Facebook Pixel Purchase Event
        if (settings?.facebookPixelId && data.order) {
          trackPixelPurchase({
            order_id: data.order.orderId,
            value: data.order.total,
            currency: 'PKR',
            content_name: data.order.variantName || 'Shahi Gurr',
            num_items: data.order.quantity || 1,
            payment_method: data.order.paymentMethod,
          });
        }
      } else {
        setFormError(data.error || 'Failed to place order. Please check details and try again.');
      }
    } catch (err: any) {
      console.error('Order submission network error:', err);
      setFormError('Network connection failed. Please check your internet and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#24140D] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#3D2619]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8F5E2B] flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-bold ${isUrdu ? 'font-urdu font-bold text-lg' : 'font-serif-brand'}`}>
                {isUrdu ? 'آرڈر مکمل کریں (Checkout)' : 'Complete Your Order'}
              </h3>
              <p className="text-xs text-[#D4A373]">
                {isUrdu ? 'کیش آن ڈیلیوری اور آن لائن پیمنٹ کی سہولت' : 'Nationwide Fast Delivery Across Pakistan'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Order Items Summary Card */}
          <div className="bg-[#F4EDE1] border border-[#E0D1BF] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D1BF]">
              <div>
                <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-wider block">
                  {selectedVariant?.weight || '1kg'} Pack
                </span>
                <h4 className={`text-base font-bold text-[#24140D] ${isUrdu ? 'font-urdu font-bold text-base' : 'font-serif-brand'}`}>
                  {isUrdu ? (selectedVariant?.urduName || 'پریمیم قدرتی میوہ دار گُڑ') : (selectedVariant?.name || 'Premium Natural Gurr with Nuts')}
                </h4>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#D9C8B5] rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 text-[#5A3E2B] hover:text-[#24140D] hover:bg-[#F4EDE1] rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-xs text-[#24140D] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-[#5A3E2B] hover:text-[#24140D] hover:bg-[#F4EDE1] rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 space-y-1.5 text-xs text-[#5A3E2B]">
              <div className="flex justify-between">
                <span>{isUrdu ? 'قیمت برائے آئٹم' : 'Item Subtotal'}:</span>
                <span className="font-bold text-[#24140D] tabular-nums">
                  {isUrdu ? formatPKRUrdu(subtotal) : formatPKR(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{isUrdu ? 'ڈیلیوری چارجز' : 'Delivery Charges'}:</span>
                <span className="font-bold tabular-nums text-[#24140D]">
                  {isUrdu ? formatPKRUrdu(deliveryCharge) : formatPKR(deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E0D1BF] text-sm font-bold text-[#24140D]">
                <span>{isUrdu ? 'ٹوٹل واجب الادا رقم' : 'Total Amount'}:</span>
                <span className="text-[#8F5E2B] text-base tabular-nums">
                  {isUrdu ? formatPKRUrdu(grandTotal) : formatPKR(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Customer Delivery Information */}
          <div className="space-y-4">
            <h4 className={`text-sm font-bold text-[#24140D] flex items-center gap-2 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              <User className="w-4 h-4 text-[#8F5E2B]" />
              <span>{isUrdu ? 'کسٹمر و ڈیلیوری معلومات' : 'Customer & Shipping Information'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'پورا نام *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder={isUrdu ? 'مثلاً: محمد بلال' : 'e.g. Muhammad Bilal'}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'موبائل نمبر (کال کے لیے) *' : 'Mobile Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e, 'phone')}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'واٹس ایپ نمبر (اختیاری)' : 'WhatsApp Number (Optional)'}
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handlePhoneChange(e, 'whatsapp')}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'شہر منتخب کریں *' : 'Destination City *'}
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                >
                  {PAKISTANI_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'مکمل پتہ (مکان نمبر، گلی، محلہ، ایریا) *' : 'Complete Delivery Address (House/Shop #, Street, Area) *'}
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={isUrdu ? 'مثلاً: مکان نمبر 12، گلی 4، بلاک سی، گلبرگ...' : 'e.g. House 14, Street 5, Phase 4 DHA / Gulberg'}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
              />
            </div>

            <div>
              <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'رائڈر کے لیے خصوصی ہدایات (اختیاری)' : 'Delivery Notes / Special Instructions'}
              </label>
              <input
                type="text"
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                placeholder={isUrdu ? 'مثلاً: پہنچ کر فون کریں یا صبح 10 سے شام 6 کے درمیان ڈیلیور کریں' : 'e.g. Call before arrival, deliver between 10am - 6pm'}
                className="w-full px-3.5 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
              />
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="space-y-4 pt-2">
            <h4 className={`text-sm font-bold text-[#24140D] flex items-center gap-2 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
              <CreditCard className="w-4 h-4 text-[#8F5E2B]" />
              <span>{isUrdu ? 'طریقہ ادائیگی منتخب کریں' : 'Choose Payment Method'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'cod', label: 'Cash on Delivery', urdu: 'کیش آن ڈیلیوری', icon: Truck },
                { id: 'easypaisa', label: 'Easypaisa', urdu: 'ایزی پیسہ', icon: CreditCard },
                { id: 'jazzcash', label: 'JazzCash', urdu: 'جاز کیش', icon: CreditCard },
                { id: 'bank', label: 'Bank / Raast', urdu: 'بینک / راست', icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = formData.paymentMethod === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: m.id as any })}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#8F5E2B] text-white border-[#8F5E2B] shadow-md'
                        : 'bg-white text-[#4A3222] border-[#D9C8B5] hover:bg-[#F4EDE1]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className={`text-xs font-bold leading-tight ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? m.urdu : m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Payment Details Box for Digital Methods */}
            {formData.paymentMethod === 'cod' && (
              <div className="bg-[#EAF5EC] border border-[#B7DFC6] rounded-2xl p-4 text-xs text-[#1E4D2B] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#2E7D32] shrink-0" />
                <p className={isUrdu ? 'font-urdu leading-relaxed' : ''}>
                  {isUrdu
                    ? 'آپ کو پارسل وصول کرتے وقت کوریئر رائیڈر کو نقد ادائیگی کرنی ہوگی۔'
                    : 'Pay exact cash to the courier representative upon doorstep parcel delivery.'}
                </p>
              </div>
            )}

            {formData.paymentMethod === 'easypaisa' && (
              <div className="bg-white border border-[#D9C8B5] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2 text-xs text-[#4A3222] w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-[#8C7662]">Account Title:</span>
                      <span className="font-bold text-[#24140D]">{settings?.easypaisaTitle || 'Khyber Gurr Co'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-[#8C7662]">Account Number:</span>
                      <span className="font-bold text-[#24140D] font-mono text-sm">{settings?.easypaisaNumber || '03001234567'}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings?.easypaisaNumber || '03001234567', 'ep')}
                        className="p-1 text-[#8F5E2B] hover:bg-[#F4EDE1] rounded cursor-pointer"
                        title="Copy Number"
                      >
                        {copiedField === 'ep' ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-[#8C7662]">Payable Amount:</span>
                      <span className="font-bold text-[#8F5E2B] font-mono text-sm">{formatPKR(grandTotal)}</span>
                    </div>
                  </div>

                  {qrDataUrl && (
                    <div className="flex flex-col items-center shrink-0 bg-[#FAF7F2] p-2 rounded-xl border border-[#D9C8B5]">
                      <img src={qrDataUrl} alt="Easypaisa QR" className="w-24 h-24" />
                      <span className="text-[10px] text-[#8C7662] mt-1 font-semibold">Scan with App</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">
                    Easypaisa Transaction ID (TID / Trx ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="e.g. 8492019482"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'jazzcash' && (
              <div className="bg-white border border-[#D9C8B5] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2 text-xs text-[#4A3222] w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-[#8C7662]">Account Title:</span>
                      <span className="font-bold text-[#24140D]">{settings?.jazzcashTitle || 'Khyber Gurr Co'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-[#8C7662]">Account Number:</span>
                      <span className="font-bold text-[#24140D] font-mono text-sm">{settings?.jazzcashNumber || '03001234567'}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings?.jazzcashNumber || '03001234567', 'jc')}
                        className="p-1 text-[#8F5E2B] hover:bg-[#F4EDE1] rounded cursor-pointer"
                        title="Copy Number"
                      >
                        {copiedField === 'jc' ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="text-[#8C7662]">Payable Amount:</span>
                      <span className="font-bold text-[#8F5E2B] font-mono text-sm">{formatPKR(grandTotal)}</span>
                    </div>
                  </div>

                  {qrDataUrl && (
                    <div className="flex flex-col items-center shrink-0 bg-[#FAF7F2] p-2 rounded-xl border border-[#D9C8B5]">
                      <img src={qrDataUrl} alt="JazzCash QR" className="w-24 h-24" />
                      <span className="text-[10px] text-[#8C7662] mt-1 font-semibold">Scan with App</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">
                    JazzCash Transaction ID (TID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="e.g. 19482019482"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'bank' && (
              <div className="bg-white border border-[#D9C8B5] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="space-y-2 text-xs text-[#4A3222]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8C7662]">Bank Name:</span>
                    <span className="font-bold text-[#24140D]">{settings?.bankName || 'Meezan Bank Ltd'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8C7662]">Account Title:</span>
                    <span className="font-bold text-[#24140D]">{settings?.bankTitle || 'Khyber Gurr Enterprises'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8C7662]">Account Number:</span>
                    <span className="font-bold text-[#24140D] font-mono">{settings?.bankAccountNumber || '01020304050607'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.bankAccountNumber || '01020304050607', 'acc')}
                      className="p-1 text-[#8F5E2B] hover:bg-[#F4EDE1] rounded cursor-pointer"
                    >
                      {copiedField === 'acc' ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#8C7662]">IBAN (Raast):</span>
                    <span className="font-bold text-[#24140D] font-mono text-[11px] truncate max-w-[200px]">{settings?.bankIban || 'PK12MEZN0001020304050607'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.bankIban || 'PK12MEZN0001020304050607', 'iban')}
                      className="p-1 text-[#8F5E2B] hover:bg-[#F4EDE1] rounded cursor-pointer"
                    >
                      {copiedField === 'iban' ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">
                    Bank / Raast Reference / Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="e.g. MEZN-8492019"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#8F5E2B] hover:bg-[#73481E] active:scale-98 text-white font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className={isUrdu ? 'font-urdu text-base font-bold' : ''}>
                {isSubmitting
                  ? (isUrdu ? 'آرڈر بک ہو رہا ہے...' : 'Placing Order...')
                  : (isUrdu ? `آرڈر بک کریں — ${formatPKRUrdu(grandTotal)}` : `Confirm Order — ${formatPKR(grandTotal)}`)}
              </span>
            </button>
            <p className="text-[11px] text-center text-[#8C7662] mt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>{isUrdu ? 'محفوظ خریداری • 100% تسلی بخش کوالٹی' : 'Safe & Encrypted Checkout • Authentic Pakistani Taste'}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
