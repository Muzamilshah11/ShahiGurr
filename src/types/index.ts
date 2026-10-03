export type Language = 'en' | 'ur';

export interface StoreSettings {
  id: string;
  storeName: string;
  urduStoreName: string;
  whatsappNumber: string;
  productName: string;
  urduProductName: string;
  basePrice: number;
  originalPrice: number;
  discountPercent: number;
  deliveryCharges: number;
  freeDeliveryThreshold: number;
  deliveryText: string;
  urduDeliveryText: string;
  easypaisaTitle: string;
  easypaisaNumber: string;
  jazzcashTitle: string;
  jazzcashNumber: string;
  bankName: string;
  bankTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  sheetsWebhookUrl: string;
  facebookPixelId?: string;
  heroHeading: string;
  heroUrduHeading: string;
  heroDescription: string;
  heroUrduDescription: string;
  heroVideoUrl: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  urduName: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  badge?: string | null;
  urduBadge?: string | null;
  description?: string | null;
  urduDescription?: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductMedia {
  id: string;
  productId: string;
  title: string;
  urduTitle: string;
  imageUrl: string;
  category: string;
  isHero: boolean;
  isVideo: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  urduName: string;
  tagline: string;
  urduTagline: string;
  description: string;
  urduDescription: string;
  active: boolean;
  variants: ProductVariant[];
  media: ProductMedia[];
}

export interface Ingredient {
  id: string;
  name: string;
  urduName: string;
  description: string;
  urduDescription: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Benefit {
  id: string;
  title: string;
  urduTitle: string;
  description: string;
  urduDescription: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Nutrition {
  id: string;
  servingSize: string;
  urduServingSize: string;
  calories: string;
  carbohydrates: string;
  sugars: string;
  protein: string;
  fat: string;
  fiber: string;
  iron: string;
  magnesium: string;
  potassium: string;
  disclaimer: string;
  urduDisclaimer: string;
}

export interface Review {
  id: string;
  customerName: string;
  urduCustomerName?: string | null;
  city: string;
  urduCity?: string | null;
  rating: number;
  comment: string;
  urduComment?: string | null;
  isVerified: boolean;
  isDemo: boolean;
  dateText: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  urduQuestion: string;
  answer: string;
  urduAnswer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  notes?: string | null;
  changedBy: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  whatsapp?: string | null;
  city: string;
  address: string;
  deliveryInstructions?: string | null;
  email?: string | null;
  variantId?: string | null;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'easypaisa' | 'jazzcash' | 'bank' | string;
  transactionId?: string | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | string;
  orderStatus: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled' | string;
  courierName?: string | null;
  trackingNumber?: string | null;
  dispatchNotes?: string | null;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt?: string;
}

export interface CheckoutFormData {
  customerName: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  deliveryInstructions: string;
  email?: string;
  paymentMethod: 'cod' | 'easypaisa' | 'jazzcash' | 'bank';
  transactionId?: string;
}
