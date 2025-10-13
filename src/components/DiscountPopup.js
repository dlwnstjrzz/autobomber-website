"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DiscountBanner({ isVisible, discountData }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const router = useRouter();

  useEffect(() => {
    if (!isVisible || !discountData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(discountData.expiresAt).getTime();
      const remainingTime = expiresAt - now;

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(remainingTime / 1000);
      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, discountData]);

  const handlePurchase = () => {
    if (discountData?.code) {
      router.push(`/purchase?discountCode=${discountData.code}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-gray-900 via-slate-800 to-black shadow-2xl">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center gap-8">
          {/* 왼쪽: 할인 코드 */}
          <div className="flex flex-col">
            {discountData?.code && (
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-lg font-semibold" style={{color: "#FCB700"}}>
                    <span>🔥</span>
                    <span>할인 코드: {discountData.code}</span>
                    <span>🔥</span>
                  </div>
                  <div className="text-sm font-semibold text-red-400">
                    24시간 후에 사라져요
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 중앙: 타이머 */}
          <div className="flex justify-center gap-6">
            <div className="rounded-lg px-6 py-4 text-center min-w-[100px] bg-gray-800">
              <div className="flex items-center justify-center gap-2">
                <span className="text-white text-4xl font-bold">{timeLeft.hours}</span>
                <span className="text-gray-300 text-sm font-medium">시간</span>
              </div>
            </div>
            <div className="rounded-lg px-6 py-4 text-center min-w-[100px] bg-gray-800">
              <div className="flex items-center justify-center gap-2">
                <span className="text-white text-4xl font-bold">{timeLeft.minutes}</span>
                <span className="text-gray-300 text-sm font-medium">분</span>
              </div>
            </div>
            <div className="rounded-lg px-6 py-4 text-center min-w-[100px] bg-gray-800">
              <div className="flex items-center justify-center gap-2">
                <span className="text-white text-4xl font-bold">{timeLeft.seconds}</span>
                <span className="text-gray-300 text-sm font-medium">초</span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 액션 버튼 */}
          <div className="flex items-center justify-end gap-6">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl font-bold">
                🏆 추가 10,000원 할인!
              </div>
            </div>

            <button
              onClick={handlePurchase}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg whitespace-nowrap"
            >
              🔥 지금 바로 구매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}