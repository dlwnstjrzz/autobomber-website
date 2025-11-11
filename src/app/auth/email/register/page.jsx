import { Suspense } from "react";
import EmailRegisterContent from "./EmailRegisterContent";

export default function EmailRegisterPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16">로딩 중입니다...</div>}>
      <EmailRegisterContent />
    </Suspense>
  );
}
