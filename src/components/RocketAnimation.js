"use client";
import { useEffect, useState, useRef } from "react";

export default function RocketAnimation({ onCardHit }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1초 후에 로켓 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 카드 히트 타이머
  useEffect(() => {
    if (!isVisible) return;

    // 순차적으로 카드 히트
    const timers = [
      setTimeout(() => onCardHit(1), 600),
      setTimeout(() => onCardHit(2), 1200),
      setTimeout(() => onCardHit(3), 1800),
      setTimeout(() => onCardHit(4), 2400)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isVisible, onCardHit]);

  if (!isVisible) return null;

  return (
    <>
      {/* 로켓 */}
      <div
        className="fixed z-50 pointer-events-none animate-rocket-fly"
        style={{
          filter: "drop-shadow(0 0 15px rgba(254, 72, 71, 0.6))"
        }}
      >
        <img
          src="/images/Rocket.gif"
          alt="Rocket"
          className="w-24 h-24 object-contain"
        />
      </div>

      {/* 로켓 트레일 파티클 */}
      <div className="fixed z-40 pointer-events-none animate-rocket-trail">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
            style={{
              left: `${i * -8}px`,
              filter: "blur(0.5px)",
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    </>
  );
}