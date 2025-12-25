"use client"

import { useState } from "react"
import { useLanguage } from "./language-context"
import { t } from "@/lib/i18n"
import { serviceCategories } from "@/lib/data"
import { ChevronDown, ChevronUp } from "lucide-react"

export function ServicesSection() {
  const { lang } = useLanguage()
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const getServiceName = (service: { name: string; nameVi: string; nameDe: string }) => {
    if (lang === "vi") return service.nameVi
    if (lang === "de") return service.nameDe
    return service.name
  }

  const getCategoryName = (category: { name: string; nameVi: string; nameDe: string }) => {
    if (lang === "vi") return category.nameVi
    if (lang === "de") return category.nameDe
    return category.name
  }

  return (
    <section id="services" className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {serviceCategories.map((category) => (
            <div key={category.id} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-sm sm:text-base text-gray-900 uppercase tracking-wide text-left pr-2">{getCategoryName(category)}</span>
                {expandedCategory === category.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {expandedCategory === category.id && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 space-y-2 sm:space-y-3">
                  {category.services.map((service) => (
                    <div key={service.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-2.5 sm:py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm sm:text-base text-gray-900">{getServiceName(service)}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {service.duration} {t("minutes", lang)}
                        </p>
                      </div>
                      <p className="font-bold text-rose-600 text-sm sm:text-base">
                        {service.priceFrom && <span className="text-xs sm:text-sm font-normal mr-1">{t("from", lang)}</span>}€
                        {service.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
