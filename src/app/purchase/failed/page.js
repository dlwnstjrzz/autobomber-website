import { Suspense } from "react";
import PurchaseFailedPageContent from "./PurchaseFailedPageContent";

export default function PurchaseFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-4">
              결제 정보를 확인하고 있어요
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
      <PurchaseFailedPageContent />
    </Suspense>
  );
}
