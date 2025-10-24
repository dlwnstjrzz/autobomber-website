import { Suspense } from "react";
import AuthPageContent from "./AuthPageContent";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8 text-center">
            <p className="text-lg font-medium text-card-foreground">
              로그인 페이지를 불러오는 중입니다...
            </p>
          </div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
