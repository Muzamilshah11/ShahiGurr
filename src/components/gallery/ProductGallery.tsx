import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductMedia } from '../../types';
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const ProductGallery: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { product } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const mediaList: ProductMedia[] = product?.media || [
    {
      id: '1',
      productId: 'default-product',
      title: 'Authentic Golden-Brown Gurr with Cashews',
      urduTitle: 'اصلی گولڈن براؤن گُڑ کاجو اور میوہ جات کے ساتھ',
      imageUrl: '/src/assets/images/hero_premium_gurr_1790948907151.jpg',
      category: 'showcase',
      isHero: true,
      isVideo: false,
      sortOrder: 1,
    },
    {
      id: '2',
      productId: 'default-product',
      title: 'Crystalline Texture & Roasted Nuts Detail',
      urduTitle: 'قدرتی کرسٹلائزڈ بناوٹ اور بھنے ہوئے میوہ جات',
      imageUrl: '/src/assets/images/gurr_texture_closeup_1790948920587.jpg',
      category: 'texture',
      isHero: false,
      isVideo: false,
      sortOrder: 2,
    },
    {
      id: '3',
      productId: 'default-product',
      title: 'Artisanal Gift Box Presentation',
      urduTitle: 'شاندار تحفاتی باکس پریزنٹیشن',
      imageUrl: '/src/assets/images/gurr_gift_packaging_1790948931604.jpg',
      category: 'packaging',
      isHero: false,
      isVideo: false,
      sortOrder: 3,
    },
    {
      id: '4',
      productId: 'default-product',
      title: 'Cozy Winter Gurr Wali Chai in Matka',
      urduTitle: 'مٹی کے پیالے میں روایتی گُڑ والی چائے',
      imageUrl: '/src/assets/images/gurr_lifestyle_tea_1790948944568.jpg',
      category: 'lifestyle',
      isHero: false,
      isVideo: false,
      sortOrder: 4,
    },
  ];

  const filteredMedia = activeCategory === 'all'
    ? mediaList
    : mediaList.filter((m) => m.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredMedia.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length);
    }
  };

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DCcb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#8F5E2B] uppercase tracking-widest block mb-2">
            {isUrdu ? 'کھانے کی اصل تصویر' : 'Visual Showcase'}
          </span>
          <h2
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-[#24140D] tracking-tight ${
              isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
            }`}
          >
            {isUrdu ? 'قدرتی گُڑ کی خوبصورتی اور کرکرا پن' : 'Real Textures, Genuine Desi Goodness'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base text-[#6B503D] ${isUrdu ? 'font-urdu leading-[2]' : ''}`}>
            {isUrdu
              ? 'ہمارے گُڑ کے ہر ٹکڑے میں کاجو، مونگ پھلی اور ناریل کے بھرپور دانے نمایاں ہیں۔'
              : 'Zoom into the crystalline natural texture, embedded roasted dry fruits, and packaging.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {[
            { id: 'all', en: 'All Photos', ur: 'تمام تصاویر' },
            { id: 'showcase', en: 'Product Showcase', ur: 'پروڈکٹ نمائش' },
            { id: 'texture', en: 'Texture & Nuts', ur: 'بناوٹ اور میوہ جات' },
            { id: 'packaging', en: 'Gift Packaging', ur: 'پیکنگ اور باکس' },
            { id: 'lifestyle', en: 'Chai & Lifestyle', ur: 'چائے اور روزمرہ' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#8F5E2B] text-white shadow-sm'
                  : 'bg-[#EFE7DC] text-[#5A3E2B] hover:bg-[#E4D7C7] hover:text-[#24140D]'
              }`}
            >
              <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? cat.ur : cat.en}</span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMedia.map((media, idx) => {
            const title = isUrdu ? media.urduTitle : media.title;

            return (
              <div
                key={media.id || idx}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden bg-[#EAE0D3] border border-[#D9C8B5] aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={media.imageUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />

                {/* Scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4" />

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-[#24140D] flex items-center justify-center shadow">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                  <p className={`text-xs font-bold text-white line-clamp-2 ${isUrdu ? 'font-urdu leading-normal' : ''}`}>
                    {title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {filteredMedia.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/20 max-h-[75vh] bg-black">
              <img
                src={filteredMedia[lightboxIndex].imageUrl}
                alt={filteredMedia[lightboxIndex].title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            {/* Caption */}
            <div className="mt-4 text-center text-white px-4">
              <h4 className={`text-base font-bold ${isUrdu ? 'font-urdu' : 'font-serif-brand'}`}>
                {isUrdu ? filteredMedia[lightboxIndex].urduTitle : filteredMedia[lightboxIndex].title}
              </h4>
              <span className="text-xs text-[#D4A373] mt-1 block">
                {lightboxIndex + 1} / {filteredMedia.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
