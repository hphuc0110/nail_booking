"use client"

import { useState } from "react"
import { useLanguage } from "./language-context"
import { t } from "@/lib/i18n"
import { galleryImages } from "@/lib/data"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

export function GallerySection() {
  const { lang } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <section id="gallery" className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8 md:mb-10">{t("gallery", lang)}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {galleryImages.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl group cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`Nail art design ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs sm:text-sm font-serif italic bg-black/40 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">MIA</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full p-2 sm:p-4 bg-transparent border-none">
          {selectedImage && (
            <div className="relative w-full flex items-center justify-center">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Gallery image"
                className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
