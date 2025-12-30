"use client"

import Link from "next/link"
import { useLanguage } from "./language-context"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { lang, setLang } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-rose-900">AMICI NAILS SALON</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-5">
          <Link href="/" className="text-sm lg:text-base text-gray-700 hover:text-rose-600 transition-colors">
            {t("home", lang)}
          </Link>
          <Link href="/#services" className="text-sm lg:text-base text-gray-700 hover:text-rose-600 transition-colors">
            {t("services", lang)}
          </Link>
          <Link href="/#gallery" className="text-sm lg:text-base text-gray-700 hover:text-rose-600 transition-colors">
            {t("gallery", lang)}
          </Link>
          <Link href="/#contact" className="text-sm lg:text-base text-gray-700 hover:text-rose-600 transition-colors">
            {t("contact", lang)}
          </Link>
          {/* <Link href="/admin" className="text-gray-700 hover:text-rose-600 transition-colors">
            {t("admin", lang)}
          </Link> */}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-700 gap-1 h-8 sm:h-9 px-2 sm:px-3">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="uppercase text-[10px] sm:text-xs font-medium">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("de")} className={lang === "de" ? "bg-rose-50" : ""}>
                {t("german", lang)} (DE)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")} className={lang === "en" ? "bg-rose-50" : ""}>
                {t("english", lang)} (EN)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("vi")} className={lang === "vi" ? "bg-rose-50" : ""}>
                {t("vietnamese", lang)} (VI)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Book Now Button */}
          <Link href="/booking" className="hidden md:block">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white text-sm lg:text-base px-3 lg:px-4">
              {t("bookNow", lang)}
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 sm:h-9 sm:w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-rose-100 px-4 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
          <Link href="/" className="text-base sm:text-lg text-gray-700 hover:text-rose-600 py-2 transition-colors" onClick={() => setMobileMenuOpen(false)}>
            {t("home", lang)}
          </Link>
          <Link
            href="/#services"
            className="text-base sm:text-lg text-gray-700 hover:text-rose-600 py-2 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("services", lang)}
          </Link>
          <Link
            href="/#gallery"
            className="text-base sm:text-lg text-gray-700 hover:text-rose-600 py-2 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("gallery", lang)}
          </Link>
          <Link
            href="/#contact"
            className="text-base sm:text-lg text-gray-700 hover:text-rose-600 py-2 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("contact", lang)}
          </Link>
          <Link href="/booking" onClick={() => setMobileMenuOpen(false)} className="mt-2">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white w-full text-base sm:text-lg py-6">
              {t("bookNow", lang)}
            </Button>
          </Link>
        </nav>
      )}
    </header>
  )
}
