import { Suspense } from "react";
import PurchasePageContent from "./PurchasePageContent";

export default function PurchasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-4">
              결제 페이지를 준비하고 있어요
            </p>
            <img
              src="/image/loadingSpinner.gif"
              alt="Loading..."
              className="w-40 h-40 mx-auto"
            />
          </div>
        </div>
      }
    >
      <PurchasePageContent />
    </Suspense>
  );
}
