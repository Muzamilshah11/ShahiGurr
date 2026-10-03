import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database for Khyber Gurr Co...');

  // 1. Admin User (Password: admin123)
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      passwordHash,
    },
  });

  // 2. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Khyber Gurr Co.',
      urduStoreName: 'خیبر گُڑ کمپنی',
      whatsappNumber: '923001234567',
      productName: 'Premium Natural Gurr with Nuts',
      urduProductName: 'پریمیم قدرتی میوہ دار گُڑ',
      basePrice: 699,
      originalPrice: 999,
      discountPercent: 30,
      deliveryCharges: 199,
      freeDeliveryThreshold: 2000,
      deliveryText: 'Express delivery nationwide across Pakistan within 2-4 business days. Pay Cash on Delivery.',
      urduDeliveryText: 'پورے پاکستان میں تیز رفتار ڈیلیوری 2 سے 4 دن میں۔ کیش آن ڈیلیوری کی سہولت۔',
      easypaisaTitle: 'Khyber Gurr Co - Muhammad Ali',
      easypaisaNumber: '03001234567',
      jazzcashTitle: 'Khyber Gurr Co - Muhammad Ali',
      jazzcashNumber: '03001234567',
      bankName: 'Meezan Bank Ltd (Islamic Banking)',
      bankTitle: 'Khyber Gurr Enterprises',
      bankAccountNumber: '0102030405060708',
      bankIban: 'PK12MEZN0001020304050607',
      sheetsWebhookUrl: '',
      heroHeading: 'Pure Desi Gurr, Rich in Traditional Taste',
      heroUrduHeading: 'خالص دیسی گُڑ — روایتی ذائقے اور صحت کی مٹھاس',
      heroDescription: 'Authentic golden-brown jaggery prepared in traditional rural cauldrons using raw unrefined sugarcane juice, embedded with roasted cashews, coconut, peanuts, and aromatic spices.',
      heroUrduDescription: 'خالص قدرتی گنے کے رس سے روایتی کڑاہوں میں تیار کردہ اصلی دیسی گُڑ، جس میں شامل ہیں منتخب بھنے ہوئے کاجو، خستہ گری، مونگ پھلی اور خوشبودار سونف۔',
      heroVideoUrl: '',
    },
  });

  // 3. Main Product
  const product = await prisma.product.upsert({
    where: { id: 'default-product' },
    update: {},
    create: {
      id: 'default-product',
      name: 'Premium Natural Gurr with Nuts',
      urduName: 'پریمیم قدرتی میوہ دار گُڑ',
      tagline: 'Traditional Gurr with Premium Roasted Nuts & Seeds',
      urduTagline: 'روایتی گُڑ، معیاری بھنے ہوئے میوہ جات اور بیجوں کے ساتھ',
      description: 'Experience the unadulterated sweetness of Pakistan’s heritage. Hand-stirred over slow wooden fire, our Gurr contains no artificial colors or refined chemicals, blended generously with roasted cashews, peanuts, desiccated coconut flakes, and sweet fennel.',
      urduDescription: 'روایتی لکڑی کی دھیمی آنچ پر تیار کردہ اصلی دیسی گُڑ، جس میں کسی قسم کا کیمیکل یا مصنوعی رنگ شامل نہیں ہے۔ منتخب کاجو، مونگ پھلی، گری اور سونف کی خوشبو ہر لقمے کو پرلطف بناتی ہے۔',
      active: true,
    },
  });

  // 4. Product Variants
  await prisma.productVariant.deleteMany({ where: { productId: product.id } });
  
  await prisma.productVariant.createMany({
    data: [
      {
        productId: product.id,
        name: '500g Trial Pack',
        urduName: '500 گرام ٹرائل پیک',
        weight: '500g',
        price: 699,
        originalPrice: 999,
        discount: 30,
        stock: 150,
        badge: 'Taster Size',
        urduBadge: 'ٹرائل سائز',
        description: 'Perfect for small families or tasting our authentic recipe.',
        urduDescription: 'چھوٹی فیملی کے لیے اور اصلی روایتی ذائقہ چکھنے کے لیے بہترین۔',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
      },
      {
        productId: product.id,
        name: '1kg Classic Pack',
        urduName: '1 کلو گرام کلاسک پیک',
        weight: '1kg',
        price: 1199,
        originalPrice: 1699,
        discount: 29,
        stock: 280,
        badge: 'Most Popular',
        urduBadge: 'سب سے مقبول',
        description: 'Our flagship 1kg pouch filled with rich nut-loaded Gurr chunks.',
        urduDescription: 'سب سے زیادہ پسند کیا جانے والا معیاری پیک، میوہ جات سے بھرپور۔',
        isDefault: true,
        isActive: true,
        sortOrder: 2,
      },
      {
        productId: product.id,
        name: '2kg Royal Gift Box',
        urduName: '2 کلو گرام رائل گفٹ باکس',
        weight: '2kg',
        price: 2199,
        originalPrice: 2999,
        discount: 27,
        stock: 85,
        badge: 'Free Delivery',
        urduBadge: 'مفت ڈیلیوری',
        description: 'Artisanal gift packaging with extra roasted cashews, ideal for gifting.',
        urduDescription: 'خوبصورت تحفاتی پیکنگ اضافی کاجو کے ساتھ، پیاروں کو بھیجنے کے لیے خاص۔',
        isDefault: false,
        isActive: true,
        sortOrder: 3,
      },
      {
        productId: product.id,
        name: '5kg Family Saver Pack',
        urduName: '5 کلو گرام فیملی سیور پیک',
        weight: '5kg',
        price: 4999,
        originalPrice: 6999,
        discount: 28,
        stock: 45,
        badge: 'Best Value',
        urduBadge: 'سب سے زیادہ بچت',
        description: 'Bulk family pack for winter desserts, tea, and daily natural sweet cravings.',
        urduDescription: 'سردیوں کے میٹھے پکوانوں اور روزمرہ چائے کے استعمال کے لیے بڑی بچت۔',
        isDefault: false,
        isActive: true,
        sortOrder: 4,
      },
    ],
  });

  // 5. Product Media
  await prisma.productMedia.deleteMany({ where: { productId: product.id } });
  await prisma.productMedia.createMany({
    data: [
      {
        productId: product.id,
        title: 'Authentic Golden-Brown Gurr with Cashews',
        urduTitle: 'اصلی گولڈن براؤن گُڑ کاجو اور میوہ جات کے ساتھ',
        imageUrl: '/src/assets/images/hero_premium_gurr_1790948907151.jpg',
        category: 'showcase',
        isHero: true,
        isVideo: false,
        sortOrder: 1,
      },
      {
        productId: product.id,
        title: 'Crystalline Texture & Roasted Nuts Detail',
        urduTitle: 'قدرتی کرسٹلائزڈ بناوٹ اور بھنے ہوئے میوہ جات',
        imageUrl: '/src/assets/images/gurr_texture_closeup_1790948920587.jpg',
        category: 'texture',
        isHero: false,
        isVideo: false,
        sortOrder: 2,
      },
      {
        productId: product.id,
        title: 'Artisanal Gift Box Presentation',
        urduTitle: 'شاندار تحفاتی باکس پریزنٹیشن',
        imageUrl: '/src/assets/images/gurr_gift_packaging_1790948931604.jpg',
        category: 'packaging',
        isHero: false,
        isVideo: false,
        sortOrder: 3,
      },
      {
        productId: product.id,
        title: 'Cozy Winter Gurr Wali Chai in Matka',
        urduTitle: 'مٹی کے پیالے میں روایتی گُڑ والی چائے',
        imageUrl: '/src/assets/images/gurr_lifestyle_tea_1790948944568.jpg',
        category: 'lifestyle',
        isHero: false,
        isVideo: false,
        sortOrder: 4,
      },
    ],
  });

  // 6. Ingredients
  await prisma.ingredient.deleteMany({});
  await prisma.ingredient.createMany({
    data: [
      {
        name: 'Pure Sugarcane Juice',
        urduName: 'خالص گنے کا رس',
        description: 'Slow-boiled natural unrefined cane extract without artificial bleaching.',
        urduDescription: 'بغیر کیمیکل اور مصنوعی رنگ کے روایتی کڑاہے میں پکا ہوا اصلی رس۔',
        iconName: 'Flame',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Whole Roasted Cashews',
        urduName: 'بھنے ہوئے ثابت کاجو',
        description: 'Golden roasted crunchy cashews folded into the warm molten jaggery.',
        urduDescription: 'گرم گُڑ میں شامل کیے گئے خستہ اور لذیذ بھنے ہوئے کاجو۔',
        iconName: 'Nut',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Desi Roasted Peanuts',
        urduName: 'دیسی مونگ پھلی',
        description: 'Freshly roasted crisp peanuts for an irresistible nutty crunch.',
        urduDescription: 'تازہ بھنی ہوئی مونگ پھلی جو گُڑ کو منفرد ذائقہ اور کرکرا پن دیتی ہے۔',
        iconName: 'Sparkles',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Desiccated Coconut (Khopra)',
        urduName: 'خشک ناریل (کھوپرا)',
        description: 'Thin shavings of rich dry coconut adding natural aroma and richness.',
        urduDescription: 'باریک کٹا ہوا خشک ناریل جو قدرتی خوشبو اور ذائقہ بڑھاتا ہے۔',
        iconName: 'Layers',
        sortOrder: 4,
        isActive: true,
      },
      {
        name: 'Aromatic Sweet Fennel (Saunf)',
        urduName: 'خوشبودار دیسی سونف',
        description: 'Handpicked sweet fennel seeds offering gentle soothing notes.',
        urduDescription: 'منتخب دیسی سونف جو ہاضمے اور خوشبو دونوں کے لیے لاجواب ہے۔',
        iconName: 'Leaf',
        sortOrder: 5,
        isActive: true,
      },
      {
        name: 'White Sesame Seeds (Til)',
        urduName: 'سفید تل',
        description: 'Toasted organic white sesame for comforting warmth and texture.',
        urduDescription: 'ہلکے بھنے ہوئے سفید تل جو روایتی گرم تاثیر اور لذت بخشتے ہیں۔',
        iconName: 'Sun',
        sortOrder: 6,
        isActive: true,
      },
    ],
  });

  // 7. Benefits
  await prisma.benefit.deleteMany({});
  await prisma.benefit.createMany({
    data: [
      {
        title: 'Authentic Traditional Taste',
        urduTitle: 'روایتی دیسی ذائقہ',
        description: 'Crafted according to ancestral village recipes with genuine rustic aroma.',
        urduDescription: 'پرانے گاؤں کے روایتی طریقوں سے تیار کردہ اصلی خوشبودار ذائقہ۔',
        iconName: 'UtensilsCrossed',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Rich Natural Sweetness',
        urduTitle: 'قدرتی غیر صاف شدہ مٹھاس',
        description: 'Retains natural minerals, iron and molasses absent in white refined sugar.',
        urduDescription: 'سفید چینی کے برعکس قدرتی معدنیات اور آئرن سے بھرپور۔',
        iconName: 'Sparkles',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: 'Hygienically Packed',
        urduTitle: 'حفظانِ صحت کے اصولوں کے مطابق پیکنگ',
        description: 'Sealed in food-grade, moisture-proof zip barrier pouches to retain freshness.',
        urduDescription: 'نمی سے محفوظ، فوڈ گریڈ زپ لاک پیکنگ تاکہ تازگی اور کرکرا پن برقرار رہے۔',
        iconName: 'ShieldCheck',
        sortOrder: 3,
        isActive: true,
      },
      {
        title: 'Perfect for Tea & Desi Desserts',
        urduTitle: 'چائے اور روایتی میٹھے کے لیے بہترین',
        description: 'Elevates Gurr Wali Chai, halwas, rice puddings (kheer), and winter panjeeri.',
        urduDescription: 'گُڑ والی کڑک چائے، سوجی کے حلوے اور سردیوں کی پنجیری کے لیے لاجواب۔',
        iconName: 'Coffee',
        sortOrder: 4,
        isActive: true,
      },
      {
        title: 'Nationwide Delivery with COD',
        urduTitle: 'پورے پاکستان میں کیش آن ڈیلیوری',
        description: 'Delivered securely to your doorstep across all cities and towns in Pakistan.',
        urduDescription: 'پاکستان کے تمام شہروں میں محفوظ ڈیلیوری، رقم پارسل وصولی کے وقت ادا کریں۔',
        iconName: 'Truck',
        sortOrder: 5,
        isActive: true,
      },
      {
        title: 'Carefully Sourced Dry Fruits',
        urduTitle: 'اعلیٰ معیار کے منتخب میوہ جات',
        description: 'Only high-grade nuts and seeds are blended, guaranteeing premium crunch.',
        urduDescription: 'صرف بہترین اور صاف ستھرے میوہ جات کا استعمال جو ہر ٹکڑے میں نظر آتے ہیں۔',
        iconName: 'Award',
        sortOrder: 6,
        isActive: true,
      },
    ],
  });

  // 8. Nutrition
  await prisma.nutrition.upsert({
    where: { id: 'default-nutrition' },
    update: {},
    create: {
      id: 'default-nutrition',
      servingSize: '100g',
      urduServingSize: '100 گرام',
      calories: '383 kcal',
      carbohydrates: '85g',
      sugars: '80g (Natural Molasses)',
      protein: '3.8g',
      fat: '4.2g (From Nuts)',
      fiber: '1.5g',
      iron: '11mg (61% Daily Value)',
      magnesium: '70mg',
      potassium: '1050mg',
      disclaimer: 'Nutritional values may vary depending on ingredients and natural batch preparation.',
      urduDisclaimer: 'غذائی معلومات اجزاء اور روایتی تیاری کے طریقے کے مطابق مختلف ہو سکتی ہیں۔',
    },
  });

  // 9. Bilingual FAQs
  await prisma.fAQ.deleteMany({});
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'How is the Gurr packed to maintain freshness?',
        urduQuestion: 'گُڑ کس طرح پیک کیا جاتا ہے تاکہ تازگی برقرار رہے؟',
        answer: 'Our Gurr is packaged in multi-layer food-grade resealable pouches with moisture barriers and silica-sealed outer cartons to prevent dampness and preserve the crunch of nuts.',
        urduAnswer: 'ہمارا گُڑ ملٹی لیئر فوڈ گریڈ زپ لاک پاؤچ میں پیک کیا جاتا ہے جو نمی سے بالکل محفوظ رہتا ہے اور میوہ جات کا کرکرا پن قائم رکھتا ہے۔',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'Do you offer Cash on Delivery (COD) across Pakistan?',
        urduQuestion: 'کیا پورے پاکستان میں کیش آن ڈیلیوری (COD) کی سہولت موجود ہے؟',
        answer: 'Yes! We deliver nationwide with Cash on Delivery to all major cities (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Quetta, Faisalabad) and smaller rural towns.',
        urduAnswer: 'جی ہاں! ہم پاکستان کے تمام بڑے شہروں اور چھوٹے علاقوں میں کیش آن ڈیلیوری کی سہولت فراہم کرتے ہیں۔ پارسل وصول کرنے پر رقم ادا کریں۔',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'What is the delivery time?',
        urduQuestion: 'آرڈر کتنے دنوں میں ڈیلیور ہوتا ہے؟',
        answer: 'Orders are typically dispatched within 24 hours. Delivery takes 2-3 business days for major cities and 3-4 business days for remote areas.',
        urduAnswer: 'تمام آرڈرز 24 گھنٹے میں روانہ کیے جاتے ہیں۔ بڑے شہروں میں 2 سے 3 دن اور دور دراز علاقوں میں 3 سے 4 دن میں ڈیلیوری ہو جاتی ہے۔',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'How should I store the Gurr at home?',
        urduQuestion: 'گُڑ کو گھر میں کس طرح محفوظ رکھنا چاہیے؟',
        answer: 'Store in an airtight container or keep it inside our resealable pouch in a cool, dry place away from direct sunlight. Refrigeration is optional during humid summer months.',
        urduAnswer: 'گُڑ کو ہوا بند ڈبے میں یا ہمارے زپ لاک پاؤچ میں خشک اور ٹھنڈی جگہ پر رکھیں۔ گرمیوں کے موسم میں فریج میں بھی رکھا جا سکتا ہے۔',
        sortOrder: 4,
        isActive: true,
      },
      {
        question: 'Does this Gurr contain artificial sugar or coloring?',
        urduQuestion: 'کیا اس گُڑ میں مصنوعی چینی یا کیمیکل ملا ہوتا ہے؟',
        answer: 'No. Our Gurr is made solely from fresh sugarcane juice and natural dry fruits. It contains no artificial bleaching agents, artificial sweeteners, or added food colors.',
        urduAnswer: 'بالکل نہیں! ہمارا گُڑ صرف خالص گنے کے رس اور معیاری خشک میوہ جات سے بنایا جاتا ہے۔ اس میں کوئی مصنوعی کیمیکل، رنگ یا چینی شامل نہیں کی جاتی۔',
        sortOrder: 5,
        isActive: true,
      },
      {
        question: 'Can I track my parcel after placing the order?',
        urduQuestion: 'کیا آرڈر کرنے کے بعد میں اپنا پارسل ٹریک کر سکتا ہوں؟',
        answer: 'Yes! Once your order is booked, you receive a unique Order ID (e.g. ORDER-482731). You can track the exact status and courier tracking code on our Order Tracking page at any time.',
        urduAnswer: 'جی ہاں! آرڈر ہوتے ہی آپ کو آرڈر آئی ڈی موصول ہوتی ہے۔ آپ ہماری ویب سائٹ کے "آرڈر ٹریکنگ" پیج پر جا کر کسی بھی وقت اپنے پارسل کا لائیو اسٹیٹس دیکھ سکتے ہیں۔',
        sortOrder: 6,
        isActive: true,
      },
    ],
  });

  // 10. Reviews (Marked clearly as Demo Data for seed)
  await prisma.review.deleteMany({});
  await prisma.review.createMany({
    data: [
      {
        customerName: 'Muhammad Hamza',
        urduCustomerName: 'محمد حمزہ',
        city: 'Lahore (Gulberg)',
        urduCity: 'لاہور',
        rating: 5,
        comment: 'Unbelievable taste and aroma! The cashews and coconut slices inside the jaggery are fresh and crunchy. Gurr wali chai tastes divine with this.',
        urduComment: 'بہت ہی زبردست اور خالص ذائقہ! گُڑ کے اندر کاجو اور ناریل کے ٹکڑے بالکل تازہ ہیں۔ گُڑ والی چائے کا مزہ دوبالا ہو گیا۔',
        isVerified: true,
        isDemo: true,
        dateText: '2 days ago',
        isActive: true,
        sortOrder: 1,
      },
      {
        customerName: 'Sardar Tariq Khan',
        urduCustomerName: 'سردار طارق خان',
        city: 'Peshawar',
        urduCity: 'پشاور',
        rating: 5,
        comment: 'Brings back the authentic taste of village Gurr. Not overly sweet, perfect texture, and very clean hygienic packaging. Will definitely order the 2kg box again.',
        urduComment: 'اصلی روایتی گُڑ کی یاد تازہ کر دی۔ صاف ستھری پیکنگ اور میوہ جات کا تناسب زبردست ہے۔ میں دوبارہ 2 کلو والا باکس آرڈر کروں گا۔',
        isVerified: true,
        isDemo: true,
        dateText: '5 days ago',
        isActive: true,
        sortOrder: 2,
      },
      {
        customerName: 'Ayesha Malik',
        urduCustomerName: 'عائشہ ملک',
        city: 'Islamabad (F-7)',
        urduCity: 'اسلام آباد',
        rating: 5,
        comment: 'Delivered in Islamabad within 48 hours. Excellent packaging. My parents loved having a small piece after dinner. 10/10 recommend!',
        urduComment: 'اسلام آباد میں صرف دو دن میں مل گیا۔ پیکنگ لاجواب ہے اور کھانے کے بعد چھوٹا سا ٹکڑا ہاضمے اور میٹھے کی طلب کے لیے بہترین ہے۔',
        isVerified: true,
        isDemo: true,
        dateText: '1 week ago',
        isActive: true,
        sortOrder: 3,
      },
      {
        customerName: 'Zubair Farooq',
        urduCustomerName: 'زبیر فاروق',
        city: 'Karachi (DHA)',
        urduCity: 'کراچی',
        rating: 5,
        comment: 'Hard to find authentic Gurr with such quality nuts in Karachi. Very satisfied with Cash on Delivery and prompt delivery via TCS.',
        urduComment: 'کراچی میں اتنا اعلیٰ اور میوہ دار گُڑ ملنا مشکل تھا۔ کیش آن ڈیلیوری پر وقت پر پارسل ملا۔ بہت خوش ہوں۔',
        isVerified: true,
        isDemo: true,
        dateText: '2 weeks ago',
        isActive: true,
        sortOrder: 4,
      },
      {
        customerName: 'Malik Kamran',
        urduCustomerName: 'ملک کامران',
        city: 'Rawalpindi',
        urduCity: 'راولپنڈی',
        rating: 5,
        comment: 'Rich caramel color and genuine desi fragrance as soon as you unzip the pouch. Excellent gift idea for family.',
        urduComment: 'پاؤچ کھولتے ہی اصلی دیسی گُڑ کی خوشبو آتی ہے۔ رشتہ داروں کو بھیجنے کے لیے شاندار تحفہ ہے۔',
        isVerified: true,
        isDemo: true,
        dateText: '3 weeks ago',
        isActive: true,
        sortOrder: 5,
      },
    ],
  });

  // 11. Initial Sample Demo Orders for Admin visualization
  const variants = await prisma.productVariant.findMany({ where: { productId: product.id } });
  const defaultVar = variants.find(v => v.isDefault) || variants[0];
  const giftVar = variants.find(v => v.weight === '2kg') || variants[0];

  const order1 = await prisma.order.upsert({
    where: { orderId: 'ORDER-482731' },
    update: {},
    create: {
      orderId: 'ORDER-482731',
      customerName: 'Daniyal Ahmed',
      phone: '03014567890',
      whatsapp: '03014567890',
      city: 'Lahore',
      address: 'House #42, Street 8, Phase 5 DHA',
      deliveryInstructions: 'Please ring the bell or call on arrival',
      email: 'daniyal@example.com',
      variantId: defaultVar.id,
      variantName: defaultVar.name,
      quantity: 2,
      unitPrice: defaultVar.price,
      subtotal: defaultVar.price * 2,
      deliveryCharge: 0,
      discount: 0,
      total: defaultVar.price * 2,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'dispatched',
      courierName: 'TCS Express',
      trackingNumber: 'TCS78942105',
      dispatchNotes: 'Dispatched via Lahore Hub. Rider assigned.',
    },
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'pending',
        notes: 'Order placed by customer via website',
        changedBy: 'System',
      },
      {
        orderId: order1.id,
        status: 'confirmed',
        notes: 'Address verified over phone call',
        changedBy: 'Admin',
      },
      {
        orderId: order1.id,
        status: 'dispatched',
        notes: 'Handed over to TCS Express (Tracking: TCS78942105)',
        changedBy: 'Admin',
      },
    ],
  });

  const order2 = await prisma.order.upsert({
    where: { orderId: 'ORDER-591824' },
    update: {},
    create: {
      orderId: 'ORDER-591824',
      customerName: 'Fatima Noor',
      phone: '03335551234',
      whatsapp: '03335551234',
      city: 'Islamabad',
      address: 'Apartment 4B, Silver Oaks, F-10/4',
      deliveryInstructions: 'Leave with building reception if not answering',
      email: 'fatima@example.com',
      variantId: giftVar.id,
      variantName: giftVar.name,
      quantity: 1,
      unitPrice: giftVar.price,
      subtotal: giftVar.price,
      deliveryCharge: 0,
      discount: 0,
      total: giftVar.price,
      paymentMethod: 'easypaisa',
      transactionId: 'EP8492019482',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      dispatchNotes: 'Packed in gift wooden box with seal',
    },
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order2.id,
        status: 'pending',
        notes: 'Order placed with Easypaisa TID EP8492019482',
        changedBy: 'System',
      },
      {
        orderId: order2.id,
        status: 'confirmed',
        notes: 'Easypaisa payment verified in account',
        changedBy: 'Admin',
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
