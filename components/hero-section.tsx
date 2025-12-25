"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "./language-context"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const { lang } = useLanguage()

  const heroImages = [
    "/Gallery/Gallery-1.webp",
    "/Gallery/Gallery-2.webp",
    "/Gallery/Gallery-3.webp",
    "/Gallery/Gallery-4.webp",
  ]

  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-white overflow-hidden">
      {/* Decorative swirl */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full text-rose-300">
          <path fill="currentColor" d="M100,10 Q150,50 140,100 Q130,150 100,190 Q70,150 60,100 Q50,50 100,10" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 lg:py-20">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 order-2 md:order-1">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600">
              <span className="font-serif italic">MIA NAGELSTUDIO</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-serif font-bold text-gray-900 tracking-tight leading-tight">
              {t("heroTitle", lang)}
            </h1>

            <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-md">{t("heroSubtitle", lang)}</p>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 uppercase tracking-wide">{t("ourServices", lang)}</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-400 rounded-full flex-shrink-0"></span>
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">{t("manicure", lang)}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-400 rounded-full flex-shrink-0"></span>
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">{t("acrylNails", lang)}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-400 rounded-full flex-shrink-0"></span>
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">{t("pedicure", lang)}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-400 rounded-full flex-shrink-0"></span>
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">{t("gelNails", lang)}</span>
                </div>
              </div>
            </div>

            <Link href="/booking">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg w-full sm:w-auto">
                {t("bookNow", lang)}
              </Button>
            </Link>
          </div>

          {/* Right Content - Image Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 order-1 md:order-2">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg ${
                  index === 0 ? "rounded-tl-[20px] sm:rounded-tl-[40px] md:rounded-tl-[80px]" : ""
                } ${index === 1 ? "rounded-tr-[20px] sm:rounded-tr-[40px] md:rounded-tr-[80px]" : ""} ${
                  index === 2 ? "rounded-bl-[20px] sm:rounded-bl-[40px] md:rounded-bl-[80px]" : ""
                } ${index === 3 ? "rounded-br-[20px] sm:rounded-br-[40px] md:rounded-br-[80px]" : ""}`}
              >
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Nail design ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
