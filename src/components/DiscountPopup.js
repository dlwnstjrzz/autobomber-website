"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DiscountBanner({ isVisible, discountData }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
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
        seconds: totalSeconds % 60,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, discountData]);

  const formatTime = (value) => String(Math.max(0, value)).padStart(2, "0");

  const handlePurchase = () => {
    if (discountData?.code) {
      router.push(`/purchase?discountCode=${discountData.code}`);
    }
  };

  if (!isVisible) return null;

  const timeSegments = [
    { label: "시간", value: formatTime(timeLeft.hours + timeLeft.days * 24) },
    { label: "분", value: formatTime(timeLeft.minutes) },
    { label: "초", value: formatTime(timeLeft.seconds) },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-8 text-center md:text-left">
          <div className="flex flex-col justify-center gap-1 text-white">
            <p className="flex items-center justify-center md:justify-start gap-2 text-lg font-semibold">
              <span>24시간만 10,000원 추가 할인</span>
              <span role="img" aria-label="fire">
                🔥
              </span>
            </p>
            {discountData?.code && (
              <p className="text-base text-gray-200">
                할인 코드:{" "}
                <span className="text-xl font-semibold text-white">
                  {discountData.code}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-white">
            {timeSegments.map((segment) => (
              <div
                key={segment.label}
                className="flex flex-col items-center justify-center gap-1 leading-tight"
              >
                <div className="flex min-w-[62px] items-center justify-center rounded-md bg-[#F5CD2F] px-1.5 py-[3px] text-2xl font-bold text-gray-900 tracking-wide">
                  {segment.value}
                </div>
                <span className="text-[11px] font-medium text-gray-300">
                  {segment.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePurchase}
              className="cursor-pointer bg-[#FF6F1A] rounded-full px-6 py-3 text-base font-bold text-black transition-colors duration-200 hover:opacity-90 whitespace-nowrap"
            >
              지금 바로 구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
