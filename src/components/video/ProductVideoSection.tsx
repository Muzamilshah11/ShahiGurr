import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Play, Pause, Volume2, VolumeX, Sparkles, Flame, Check } from 'lucide-react';

export const ProductVideoSection: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { settings, openCheckoutWithVariant } = useStore();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoPoster = '/src/assets/images/gurr_lifestyle_tea_1790948944568.jpg';
  const customVideoUrl = settings?.heroVideoUrl;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#24140D] text-[#FAF7F2] relative overflow-hidden border-b border-[#3D2619]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text / Heritage Story */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4A373] bg-[#3D2619] px-3.5 py-1.5 rounded-full border border-[#5C3D2B]">
              <Flame className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className={isUrdu ? 'font-urdu' : 'uppercase tracking-wider'}>
                {isUrdu ? 'روایتی کڑاہا اور کاریگری' : 'Heritage Craftsmanship'}
              </span>
            </div>

            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight ${
                isUrdu ? 'font-urdu font-bold leading-[1.8] text-2xl sm:text-3xl lg:text-4xl' : 'font-serif-brand'
              }`}
            >
              {isUrdu
                ? 'دیکھیے کیسے بنتا ہے اصلی روایتی گُڑ'
                : 'Watch The Authentic Desi Preparation'}
            </h2>

            <p className={`text-sm sm:text-base text-[#D4C3B3] leading-relaxed ${isUrdu ? 'font-urdu leading-[2.1]' : ''}`}>
              {isUrdu
                ? 'صبح سویرے کٹے ہوئے گنے کا رس لکڑی کی قدرتی آگ پر پکایا جاتا ہے۔ جب گُڑ گاڑھا ہو کر سنہری رنگت اختیار کرتا ہے تو اس میں تازہ بھنے ہوئے کاجو، مونگ پھلی، گری اور سونف شامل کی جاتی ہے۔'
                : 'From boiling pure morning-harvested sugarcane juice in seasoned iron cauldrons to hand-folding freshly roasted cashews and aromatic spices, experience our centuries-old village tradition.'}
            </p>

            <div className="space-y-3 pt-2 text-sm text-[#E0D1BF]">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'کوئی مصنوعی کیمیکل یا بلیچنگ نہیں' : 'No artificial chemical bleaching or coloring'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'قدرتی لکڑی کی دھیمی آنچ پر پکائی' : 'Slow wood-fired reduction process'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'ہر ٹکڑے میں بھنے ہوئے کاجو کی بھرپور موجودگی' : 'Loaded with handpicked roasted nuts'}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => openCheckoutWithVariant()}
                className="px-7 py-3.5 text-sm font-semibold text-[#24140D] bg-[#D4A373] hover:bg-[#C49363] active:scale-98 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <span className={isUrdu ? 'font-urdu text-sm font-bold' : ''}>
                  {isUrdu ? 'تازہ گُڑ ابھی گھر منگوائیں' : 'Order Fresh Gurr To Your Door'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Video / Interactive Showcase Player */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-[#5C3D2B] shadow-2xl bg-black aspect-[16/9] group">
              {customVideoUrl ? (
                <video
                  ref={videoRef}
                  src={customVideoUrl}
                  poster={videoPoster}
                  muted={isMuted}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  onClick={togglePlay}
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={videoPoster}
                    alt="Authentic Pakistani Gurr Video Showcase"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                    <div
                      onClick={togglePlay}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D4A373] hover:bg-[#C49363] text-[#24140D] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer mb-4"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                      {isUrdu ? 'ویڈیو دیکھیں: اصلی کڑاہا اور میوہ جات' : 'Artisanal Preparation & Texture'}
                    </span>
                    <span className="text-xs text-[#D4A373] mt-1">
                      {isUrdu ? 'خالص دیسی گُڑ کی تیاری کا عمل' : 'Authentic Rural Handcrafted Tradition'}
                    </span>
                  </div>
                </div>
              )}

              {/* Player Floating Controls if active video */}
              {customVideoUrl && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <button
                    onClick={togglePlay}
                    className="p-2 text-white hover:text-[#D4A373] transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 text-white hover:text-[#D4A373] transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
