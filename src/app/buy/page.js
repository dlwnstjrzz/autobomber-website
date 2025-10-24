import { Suspense } from "react";
import { CheckoutPage } from "@/components/Checkout";

export default function BuyPage() {
  return (
    <Suspense
      fallback={
        <div className="wrapper w-100 flex items-center justify-center">
          <p className="text-gray-600">결제 정보를 불러오는 중입니다...</p>
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}
