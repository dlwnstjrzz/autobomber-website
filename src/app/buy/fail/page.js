"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailPage() {
  const [errorInfo, setErrorInfo] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');

    setErrorInfo({
      code,
      message,
      orderId,
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          {/* 실패 아이콘 */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* 실패 메시지 */}
          <h1 className="text-3xl font-bold text-white mb-4">결제에 실패했습니다</h1>
          <p className="text-gray-400 mb-8">결제 처리 중 문제가 발생했습니다.</p>

          {/* 오류 정보 */}
          {errorInfo && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">오류 정보</h2>
              <div className="space-y-3 text-left">
                {errorInfo.orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">주문번호</span>
                    <span className="text-white font-mono text-sm">{errorInfo.orderId}</span>
                  </div>
                )}
                {errorInfo.code && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">오류코드</span>
                    <span className="text-red-400">{errorInfo.code}</span>
                  </div>
                )}
                {errorInfo.message && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-gray-400">오류메시지</span>
                    <span className="text-white text-sm break-words">{errorInfo.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/buy'}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              다시 결제하기
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-600 hover:border-gray-500 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              홈으로 가기
            </button>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 text-sm text-gray-500">
            <p>문제가 지속될 경우 고객센터로 문의해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}