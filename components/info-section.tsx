"use client"

import Link from "next/link"
import { useLanguage } from "./language-context"
import { t } from "@/lib/i18n"
import { businessHours, contactInfo } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Phone } from "lucide-react"

export function InfoSection() {
  const { lang } = useLanguage()

  const getDayName = (hour: { day: string; dayVi: string; dayDe: string }) => {
    if (lang === "vi") return hour.dayVi
    if (lang === "de") return hour.dayDe
    return hour.day
  }

  return (
    <section id="contact" className="py-8 sm:py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div >
          {/* Left - Business Info */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{contactInfo.name}</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex items-start gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-rose-500 flex-shrink-0" />
                <span className="break-words">{contactInfo.address}</span>
              </p>

              <Link href="/booking">
                <Button className="w-full bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 py-5 sm:py-6 text-sm sm:text-base">
                  {t("bookNow", lang)}
                </Button>
              </Link>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t("businessHours", lang)}</h3>
              <div className="space-y-2">
                {businessHours.map((hour) => (
                  <div key={hour.day} className="flex justify-between text-sm sm:text-base text-gray-700">
                    <span>{getDayName(hour)}</span>
                    <span className="text-right">{hour.closed ? t("closed", lang) : `${hour.open} - ${hour.close}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t("contactUs", lang)}</h3>

              <div className="space-y-2 sm:space-y-3">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-full border border-gray-200 hover:border-rose-300 transition-colors"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base text-gray-700 break-all">{contactInfo.email}</span>
                </a>

                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-full border border-gray-200 hover:border-rose-300 transition-colors"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">{contactInfo.phone}</span>
                </a>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3 mt-4 sm:mt-6">
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="hidden sm:inline">Instagram</span>
                  <span className="sm:hidden">IG</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
