import { Suspense } from "react";
import SuccessPageContent from "./SuccessPageContent";

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ backgroundColor: "#FEFEFE" }}
        >
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-4">
              결제 정보를 불러오고 있어요
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
      <SuccessPageContent />
    </Suspense>
  );
}
