import HeroSection from "./components/HeroSection";
import StoreIntroSection from "./components/StoreIntroSection";
import FeaturedCategorySection from "./components/FeaturedCategorySection";
import BrowseCategorySection from "./components/BrowseCategorySection";
import ProductShowcaseSection from "./components/ProductShowcaseSection";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-[#fbfbfd] text-(--text-primary)">
      <HeroSection />
      <StoreIntroSection />
      <FeaturedCategorySection />
      <BrowseCategorySection />
      <ProductShowcaseSection />
    </div>
  );
}
