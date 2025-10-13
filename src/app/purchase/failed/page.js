"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function PurchaseFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">결제 실패</h1>
          <p className="text-muted-foreground mb-4">
            결제 처리 중 문제가 발생했습니다.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                오류 내용: {error}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card text-card-foreground rounded-lg p-6 text-left">
            <h2 className="font-semibold mb-3">가능한 원인</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>결제 정보 입력 오류</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>카드 한도 초과 또는 잔액 부족</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>네트워크 연결 문제</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>사용자 결제 취소</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="block w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              다시 시도하기
            </button>
            <Link 
              href="/"
              className="block w-full py-3 px-6 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors text-center"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              문제가 지속될 경우 고객지원센터로 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-4">결제 정보를 확인하고 있어요</p>
          <img
            src="/image/loadingSpinner.gif"
            alt="Loading..."
            className="w-40 h-40 mx-auto"
          />
        </div>
      </div>
    }>
      <PurchaseFailedContent />
    </Suspense>
  );
}