import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider } from './context/StoreContext';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Header } from './components/common/Header';
import { HeroSection } from './components/hero/HeroSection';
import { BenefitsSection } from './components/benefits/BenefitsSection';
import { VariantSelector } from './components/variants/VariantSelector';
import { ProductGallery } from './components/gallery/ProductGallery';
import { ProductVideoSection } from './components/video/ProductVideoSection';
import { IngredientsSection } from './components/ingredients/IngredientsSection';
import { WhyOurGurr } from './components/why/WhyOurGurr';
import { ServingIdeas } from './components/serving/ServingIdeas';
import { NutritionSection } from './components/nutrition/NutritionSection';
import { TrustBadges } from './components/trust/TrustBadges';
import { CustomerReviews } from './components/reviews/CustomerReviews';
import { FAQSection } from './components/faq/FAQSection';
import { FinalCTA } from './components/cta/FinalCTA';
import { Footer } from './components/common/Footer';
import { FloatingWhatsApp } from './components/floating/FloatingWhatsApp';
import { StickyMobileBuyBar } from './components/floating/StickyMobileBuyBar';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderSuccessModal } from './components/checkout/OrderSuccessModal';
import { OrderTrackingModal } from './components/tracking/OrderTrackingModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <StoreProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#24140D] selection:bg-[#D4A373] selection:text-white">
          {/* Announcement Bar */}
          <AnnouncementBar />

          {/* Top Bar Header */}
          <Header />

          {/* Main Landing Sections */}
          <main className="flex-1">
            <HeroSection />
            <BenefitsSection />
            <VariantSelector />
            <ProductGallery />
            <ProductVideoSection />
            <IngredientsSection />
            <WhyOurGurr />
            <ServingIdeas />
            <NutritionSection />
            <TrustBadges />
            <CustomerReviews />
            <FAQSection />
            <FinalCTA />
          </main>

          {/* Footer */}
          <Footer />

          {/* Floating Action Controls */}
          <FloatingWhatsApp />
          <StickyMobileBuyBar />

          {/* Modals & Portals */}
          <CheckoutModal />
          <OrderSuccessModal />
          <OrderTrackingModal />
          <AdminDashboard />
        </div>
      </StoreProvider>
    </LanguageProvider>
  );
}
