import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import MarginCalculator from "@/components/MarginCalculator";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* <ProductSection /> */}
      <MarginCalculator />
    </>
  );
}
