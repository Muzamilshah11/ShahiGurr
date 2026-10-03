import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Search, Menu, X, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, isUrdu } = useLanguage();
  const { settings, setIsTrackingOpen, openCheckoutWithVariant } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const brandName = isUrdu
    ? (settings?.urduStoreName?.trim() || settings?.storeName?.trim() || 'شاہی گُڑ')
    : (settings?.storeName?.trim() || 'Shahi Gurr Co.');

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Robust scroll listener: Hide when scrolling down, show when scrolling up
  // Does not close or hide header when mobile menu is open
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      // If mobile menu is open, freeze visibility so header and drawer stay visible
      if (mobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastY;

      // Always visible near the top
      if (currentScrollY < 60) {
        setIsVisible(true);
      } else if (scrollDiff > 10 && currentScrollY > 100) {
        // Scrolling down with positive delta -> hide header
        setIsVisible(false);
      } else if (scrollDiff < -6) {
        // Scrolling up with negative delta -> show header
        setIsVisible(true);
      }

      lastY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  return (
    <header
      dir="ltr"
      className={`sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EADFCF] transition-transform duration-300 ease-in-out shadow-xs ${
        isVisible || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Single text element wordmark (Always on Left) */}
          <div className="flex items-center gap-2">
            <a
              href="#"
              className={`text-2xl sm:text-3xl font-bold tracking-tight text-[#24140D] hover:text-[#8F5E2B] transition-colors tracking-wide ${
                isUrdu ? 'font-urdu text-2xl font-bold leading-normal' : 'font-serif-brand'
              }`}
            >
              {brandName}
            </a>
          </div>

          {/* Zone 2: English Navigation Links (Always in Middle) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#4A3222]">
            <a href="#benefits" className="hover:text-[#8F5E2B] transition-colors">
              Benefits
            </a>
            <a href="#variants" className="hover:text-[#8F5E2B] transition-colors">
              Sizes & Pricing
            </a>
            <a href="#ingredients" className="hover:text-[#8F5E2B] transition-colors">
              Ingredients
            </a>
            <a href="#why-us" className="hover:text-[#8F5E2B] transition-colors">
              Why Our Gurr
            </a>
            <a href="#serving" className="hover:text-[#8F5E2B] transition-colors">
              How to Enjoy
            </a>
            <a href="#reviews" className="hover:text-[#8F5E2B] transition-colors">
              Reviews
            </a>
          </nav>

          {/* Zone 3: Primary Actions & Mobile Hamburger (Always on Right) */}
          <div className="flex items-center gap-3">
            {/* Track Order Button */}
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#4A3222] hover:text-[#24140D] hover:bg-[#EFE7DC] rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#8F5E2B]" />
              <span>Track Order</span>
            </button>

            {/* Primary Order Now Button */}
            <button
              onClick={() => openCheckoutWithVariant()}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#8F5E2B] hover:bg-[#73481E] active:scale-98 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now</span>
            </button>

            {/* Mobile Menu Toggle (Always on Right) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#4A3222] hover:text-[#24140D] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop to dismiss on outside click */}
          <div
            className="fixed inset-0 top-20 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <div
            dir="ltr"
            className="absolute top-full left-0 right-0 w-full bg-[#FAF7F2] border-b border-[#EADFCF] px-4 pt-2 pb-6 space-y-3 shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto z-50 text-left"
          >
          <div className="flex flex-col space-y-2 pt-2 pb-3 border-b border-[#EADFCF]">
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#24140D] hover:bg-[#EFE7DC] rounded-md transition-colors"
            >
              Benefits
            </a>
            <a
              href="#variants"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#24140D] hover:bg-[#EFE7DC] rounded-md transition-colors"
            >
              Sizes & Pricing
            </a>
            <a
              href="#ingredients"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#24140D] hover:bg-[#EFE7DC] rounded-md transition-colors"
            >
              Ingredients
            </a>
            <a
              href="#why-us"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#24140D] hover:bg-[#EFE7DC] rounded-md transition-colors"
            >
              Why Our Gurr
            </a>
            <a
              href="#serving"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#24140D] hover:bg-[#EFE7DC] rounded-md transition-colors"
            >
              How to Enjoy
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#24140D] hover:bg-[#EFE7DC] rounded-md transition-colors"
            >
              Reviews
            </a>
          </div>

          {/* Language Switcher inside Mobile Drawer */}
          <div className="py-2 border-b border-[#EADFCF]">
            <div className="flex items-center justify-between p-2.5 bg-[#EFE7DC] rounded-xl border border-[#D9C8B5]">
              <span className="text-xs font-bold text-[#4A3222] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#8F5E2B]" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'زبان منتخب کریں' : 'Language'}</span>
              </span>
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#D9C8B5]">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#8F5E2B] text-white shadow-xs'
                      : 'text-[#4A3222] hover:bg-[#EFE7DC]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ur')}
                  className={`px-3 py-1 text-xs font-bold rounded-md font-urdu transition-all cursor-pointer ${
                    language === 'ur'
                      ? 'bg-[#8F5E2B] text-white shadow-xs'
                      : 'text-[#4A3222] hover:bg-[#EFE7DC]'
                  }`}
                >
                  اردو
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsTrackingOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-[#24140D] bg-[#EFE7DC] hover:bg-[#E4D7C7] rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#8F5E2B]" />
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </>
    )}
  </header>
  );
};
