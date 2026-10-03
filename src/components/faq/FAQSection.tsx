import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { faqs, settings } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleWhatsAppHelp = () => {
    const phone = settings?.whatsappNumber || '923001234567';
    const msg = isUrdu ? 'السلام علیکم، مجھے گُڑ کے آرڈر سے متعلق رہنمائی چاہیے' : 'Assalam-o-Alaikum, I have a question regarding ordering Gurr';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <section id="faq" className="py-16 sm:py-20 bg-[#F4EDE1] border-b border-[#E0D1BF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'معلومات و رہنمائی' : 'Questions & Answers'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'اکثر پوچھے گئے سوالات' : 'Frequently Asked Questions'}
          </h2>
          <p className={`mt-2 text-sm text-[#6B503D] ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu
              ? 'ڈیلیوری، پیکنگ اور ادائیگی سے متعلق تمام بنیادی سوالات کے تسلی بخش جوابات۔'
              : 'Everything you need to know about delivery, freshness, ingredients, and COD.'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const question = isUrdu ? faq.urduQuestion : faq.question;
            const answer = isUrdu ? faq.urduAnswer : faq.answer;

            return (
              <div
                key={faq.id || idx}
                className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className={`text-base font-bold text-[#24140D] ${isUrdu ? 'font-urdu font-bold text-base text-right' : 'font-serif-brand'}`}>
                    {question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-[#EFE7DC] text-[#8F5E2B] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#8F5E2B] text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-0 border-t border-[#EFE7DC]">
                    <p className={`text-sm text-[#5A3E2B] leading-relaxed pt-3 ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
                      {answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Prompt */}
        <div className="mt-10 text-center bg-[#FAF7F2] border border-[#D9C8B5] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className={`text-sm font-bold text-[#24140D] ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'کوئی اور سوال ہے؟' : 'Have another question?'}
            </h4>
            <p className={`text-xs text-[#6B503D] ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'ہماری واٹس ایپ کسٹمر سپورٹ ٹیم 24/7 دستیاب ہے۔' : 'Our team is available on WhatsApp to assist you directly.'}
            </p>
          </div>

          <button
            onClick={handleWhatsAppHelp}
            className="px-5 py-2.5 text-xs font-semibold text-[#1F4E38] bg-[#E3F2E9] hover:bg-[#D3EADB] border border-[#B7DFC6] rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'واٹس ایپ پر پوچھیں' : 'Chat on WhatsApp'}</span>
          </button>
        </div>

      </div>
    </section>
  );
};
