"use client";

import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import ProductSection from "./ProductSection";
import DiscountBanner from "./DiscountPopup";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";

export default function HomeWithDiscount() {
  const [showBanner, setShowBanner] = useState(false);
  const { isEligible, discountData, loading } = useDiscountEligibility();

  useEffect(() => {
    if (loading) return;

    // 자격이 있는 경우 즉시 배너 표시
    if (isEligible && discountData) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [isEligible, discountData, loading]);

  return (
    <>
      <HeroSection />
      <ProductSection />

      <DiscountBanner isVisible={showBanner} discountData={discountData} />
    </>
  );
}
