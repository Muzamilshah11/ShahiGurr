import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  ProductVariant,
  StoreSettings,
  Ingredient,
  Benefit,
  Nutrition,
  Review,
  FAQ,
  Order,
} from '../types';
import { initFacebookPixel, trackPixelInitiateCheckout } from '../utils/facebookPixel';

interface StoreContextType {
  product: Product | null;
  settings: StoreSettings | null;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (variant: ProductVariant) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  ingredients: Ingredient[];
  benefits: Benefit[];
  nutrition: Nutrition | null;
  reviews: Review[];
  faqs: FAQ[];
  isLoading: boolean;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  completedOrder: Order | null;
  setCompletedOrder: (order: Order | null) => void;
  refreshStoreData: () => Promise<void>;
  openCheckoutWithVariant: (variant?: ProductVariant, qty?: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [nutrition, setNutrition] = useState<Nutrition | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [
        prodRes,
        settingsRes,
        ingRes,
        benRes,
        nutRes,
        revRes,
        faqRes,
      ] = await Promise.all([
        fetch('/api/product'),
        fetch('/api/settings'),
        fetch('/api/ingredients'),
        fetch('/api/benefits'),
        fetch('/api/nutrition'),
        fetch('/api/reviews'),
        fetch('/api/faqs'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProduct(prodData.product);
        if (prodData.product?.variants?.length) {
          setVariants(prodData.product.variants);
          const defaultVar = prodData.product.variants.find((v: ProductVariant) => v.isDefault) || prodData.product.variants[0];
          setSelectedVariant((prev) => prev || defaultVar);
        }
      }

      if (settingsRes.ok) {
        const settsData = await settingsRes.json();
        setSettings(settsData.settings);
      }

      if (ingRes.ok) {
        const ingData = await ingRes.json();
        setIngredients(ingData.ingredients || []);
      }

      if (benRes.ok) {
        const benData = await benRes.json();
        setBenefits(benData.benefits || []);
      }

      if (nutRes.ok) {
        const nutData = await nutRes.json();
        setNutrition(nutData.nutrition);
      }

      if (revRes.ok) {
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
      }

      if (faqRes.ok) {
        const faqData = await faqRes.json();
        setFaqs(faqData.faqs || []);
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Initialize Meta / Facebook Pixel whenever settings are loaded or updated
  useEffect(() => {
    if (settings?.facebookPixelId) {
      initFacebookPixel(settings.facebookPixelId);
    }
  }, [settings?.facebookPixelId]);

  const openCheckoutWithVariant = (variant?: ProductVariant, qty?: number) => {
    const targetVariant = variant || selectedVariant;
    const targetQty = qty || quantity || 1;

    if (variant) {
      setSelectedVariant(variant);
    }
    if (qty && qty > 0) {
      setQuantity(qty);
    }
    setIsCheckoutOpen(true);

    // Track Meta / Facebook Pixel InitiateCheckout event
    if (settings?.facebookPixelId) {
      const price = targetVariant?.price || settings?.basePrice || 1199;
      trackPixelInitiateCheckout({
        value: price * targetQty,
        currency: 'PKR',
        num_items: targetQty,
        content_name: targetVariant?.name || 'Shahi Gurr',
      });
    }
  };

  return (
    <StoreContext.Provider
      value={{
        product,
        settings,
        variants,
        selectedVariant,
        setSelectedVariant,
        quantity,
        setQuantity,
        ingredients,
        benefits,
        nutrition,
        reviews,
        faqs,
        isLoading,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        isAdminOpen,
        setIsAdminOpen,
        completedOrder,
        setCompletedOrder,
        refreshStoreData: fetchAllData,
        openCheckoutWithVariant,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
