"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    setPaymentInfo({
      orderId,
      amount: amount ? parseInt(amount) : 0,
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          {/* 성공 아이콘 */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* 성공 메시지 */}
          <h1 className="text-3xl font-bold text-white mb-4">결제가 완료되었습니다!</h1>
          <p className="text-gray-400 mb-8">안전하게 결제가 처리되었습니다.</p>

          {/* 결제 정보 */}
          {paymentInfo && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">결제 정보</h2>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">주문번호</span>
                  <span className="text-white font-mono text-sm">{paymentInfo.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">결제금액</span>
                  <span className="text-white font-semibold">{paymentInfo.amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">상품명</span>
                  <span className="text-white">오토봄버 제품</span>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              홈으로 가기
            </button>
            <button
              onClick={() => window.location.href = '/buy'}
              className="w-full border border-gray-600 hover:border-gray-500 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              추가 구매하기
            </button>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 text-sm text-gray-500">
            <p>결제 관련 문의사항이 있으시면 고객센터로 연락해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}