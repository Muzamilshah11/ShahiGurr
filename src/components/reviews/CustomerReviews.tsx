import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Star, CheckCircle, MessageSquarePlus, X, Send } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { reviews, refreshStoreData } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Lahore');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setErrorMsg(isUrdu ? 'برائے مہربانی نام اور کمنٹ درج کریں' : 'Please provide your name and review');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          city: city.trim(),
          rating,
          comment: comment.trim(),
          isVerified: true,
          isDemo: false,
          dateText: 'Just now',
          isActive: true,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        await refreshStoreData();
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setName('');
          setComment('');
        }, 1500);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to submit review');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DCcb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Review CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
              {isUrdu ? 'حقیقی تجربات' : 'Customer Feedback'}
            </span>
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
                isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
              }`}
            >
              {isUrdu ? 'ہمارے معزز خریداروں کی رائے' : 'What Gurr Lovers Across Pakistan Say'}
            </h2>
            <p className={`mt-2 text-sm text-[#6B503D] ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu
                ? 'لاہور، اسلام آباد، کراچی، پشاور اور راولپنڈی سے ہمارے قدردانوں کے تاثرات۔'
                : 'Real experiences from Gurr enthusiasts across Lahore, Islamabad, Peshawar & Karachi.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#8F5E2B] bg-[#EFE7DC] hover:bg-[#E4D7C7] border border-[#D9C8B5] rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu text-sm' : ''}>{t('writeReview')}</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => {
            const customerName = isUrdu ? (review.urduCustomerName || review.customerName) : review.customerName;
            const city = isUrdu ? (review.urduCity || review.city) : review.city;
            const comment = isUrdu ? (review.urduComment || review.comment) : review.comment;

            return (
              <div
                key={review.id}
                className="bg-[#F6EFE5] border border-[#E2D4C3] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Rating Stars & City */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-[#8F5E2B]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-[#8F5E2B] text-[#8F5E2B]' : 'text-[#D9C8B5]'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold text-[#8F5E2B] bg-[#EFE7DC] px-2.5 py-0.5 rounded-md ${isUrdu ? 'font-urdu' : ''}`}>
                      {city}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className={`text-sm text-[#3E2A1C] leading-relaxed mb-6 ${isUrdu ? 'font-urdu leading-[2.2]' : ''}`}>
                    "{comment}"
                  </p>
                </div>

                {/* Customer Details Footer */}
                <div className="pt-4 border-t border-[#E8DCcb] flex items-center justify-between text-xs">
                  <div>
                    <span className={`font-bold text-[#24140D] block ${isUrdu ? 'font-urdu text-sm' : 'font-serif-brand'}`}>
                      {customerName}
                    </span>
                    <span className="text-[#8C7662]">{review.dateText}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#2E7D32] text-[11px] font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'تصدیق شدہ خریدار' : 'Verified Buyer'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#8C7662] hover:text-[#24140D] p-1.5 rounded-lg hover:bg-[#EFE7DC] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className={`text-xl font-bold text-[#24140D] mb-1 ${isUrdu ? 'font-urdu font-bold text-xl' : 'font-serif-brand'}`}>
              {isUrdu ? 'اپنی رائے درج کریں' : 'Share Your Experience'}
            </h3>
            <p className={`text-xs text-[#6B503D] mb-6 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'آپ کا فیڈبیک ہمارے لیے انتہائی قیمتی ہے۔' : 'Help other customers discover authentic Pakistani Gurr.'}
            </p>

            {submitSuccess ? (
              <div className="bg-[#E9F5ED] border border-[#2E7D32] rounded-2xl p-6 text-center text-[#1B5E20]">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-[#2E7D32]" />
                <h4 className="font-bold text-base">{isUrdu ? 'شکریہ! آپ کا ریویو درج ہو گیا ہے' : 'Thank you! Your review has been recorded.'}</h4>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'آپ کا نام' : 'Your Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً: عثمان خان' : 'e.g. Usman Khan'}
                    className="w-full px-4 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'شہر' : 'City *'}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                    >
                      {['Lahore', 'Islamabad', 'Rawalpindi', 'Karachi', 'Peshawar', 'Multan', 'Faisalabad', 'Quetta', 'Sialkot', 'Gujranwala', 'Other City'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'ریٹنگ' : 'Rating *'}
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 / 5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 / 5)</option>
                      <option value={3}>⭐⭐⭐ (3 / 5)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold text-[#4A3222] mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'آپ کی تفصیلی رائے' : 'Your Review *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isUrdu ? 'گُڑ کے ذائقے، میوہ جات اور پیکنگ کے بارے میں بتائیں...' : 'Tell us about the taste, texture, nuts, and delivery...'}
                    className="w-full px-4 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span className={isUrdu ? 'font-urdu text-sm' : ''}>
                    {isSubmitting ? (isUrdu ? 'جمع ہو رہا ہے...' : 'Submitting...') : (isUrdu ? 'ریویو جمع کریں' : 'Submit Review')}
                  </span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
