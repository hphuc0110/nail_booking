import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { GallerySection } from "@/components/gallery-section"
import { InfoSection } from "@/components/info-section"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <InfoSection />
    </main>
  )
}
