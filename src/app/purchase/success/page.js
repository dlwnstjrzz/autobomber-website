"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import RocketAnimation from '@/components/RocketAnimation';

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const plan = searchParams.get('plan');

  const [flippedCards, setFlippedCards] = useState({
    card1: false,
    card2: false,
    card3: false,
    card4: false
  });

  const [showButtons, setShowButtons] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);


  useEffect(() => {
    console.log('결제 성공:', { orderId, amount, plan });

    // 단계별 애니메이션 시퀀스
    const timers = [
      setTimeout(() => setCurrentStep(1), 800),
      setTimeout(() => setCurrentStep(2), 1600),
      setTimeout(() => setCurrentStep(3), 2400),
      setTimeout(() => setCurrentStep(4), 3200),
      setTimeout(() => setShowButtons(true), 4000),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [orderId, amount, plan]);

  const handleCardHit = (cardNumber) => {
    console.log('Card hit:', cardNumber);
    setFlippedCards(prev => ({
      ...prev,
      [`card${cardNumber}`]: true
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* 로켓 애니메이션 */}
      <RocketAnimation onCardHit={handleCardHit} />

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full mx-auto">

          {/* 제목 */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-1">결제 완료!</h1>
            <p className="text-muted-foreground text-sm">구매해주셔서 감사합니다</p>
          </div>

          {/* 정보 카드들 */}
          <div className="space-y-3 mb-6">

            {/* 결제 상태 */}
            <div
              className="bg-card border border-border rounded-lg p-4 transition-all duration-500"
              style={{
                opacity: currentStep >= 1 ? 1 : 0,
                transform: currentStep >= 1 ? 'translateX(0)' : 'translateX(-20px)',
                borderColor: currentStep >= 1 ? "rgba(254, 72, 71, 0.3)" : "rgba(229, 231, 235, 0.2)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={currentStep >= 1 ? 'animate-pulse' : ''}>
                    <div className="text-primary">
                      {currentStep >= 1 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">결제 상태</div>
                    <div className="text-xs text-muted-foreground">
                      {currentStep >= 1 ? '성공적으로 처리됨' : '처리 중...'}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  currentStep >= 1
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep >= 1 ? '완료' : '대기'}
                </span>
              </div>
            </div>

            {/* 결제 금액 */}
            <div
              className="bg-card border border-border rounded-lg p-4 transition-all duration-500"
              style={{
                opacity: currentStep >= 2 ? 1 : 0,
                transform: currentStep >= 2 ? 'translateX(0)' : 'translateX(-20px)',
                borderColor: currentStep >= 2 ? "rgba(254, 72, 71, 0.3)" : "rgba(229, 231, 235, 0.2)",
                transitionDelay: '0.1s'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={currentStep >= 2 ? 'animate-pulse' : ''}>
                    <div className="text-primary">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">결제 금액</div>
                    <div className="text-xs text-muted-foreground">
                      {plan === 'yearly' ? '1년 이용권' : '체험판'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">
                    {currentStep >= 2 ? `₩${amount ? Number(amount).toLocaleString() : '0'}` : '---'}
                  </div>
                </div>
              </div>
            </div>

            {/* 주문번호 */}
            <div
              className="bg-card border border-border rounded-lg p-4 transition-all duration-500"
              style={{
                opacity: currentStep >= 3 ? 1 : 0,
                transform: currentStep >= 3 ? 'translateX(0)' : 'translateX(-20px)',
                borderColor: currentStep >= 3 ? "rgba(254, 72, 71, 0.3)" : "rgba(229, 231, 235, 0.2)",
                transitionDelay: '0.2s'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">주문번호</div>
                    <div className="text-xs text-muted-foreground font-mono break-all">
                      {currentStep >= 3 ? (orderId || 'N/A') : '생성 중...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 다음 단계 */}
            <div
              className="bg-card border border-border rounded-lg p-4 transition-all duration-500"
              style={{
                opacity: currentStep >= 4 ? 1 : 0,
                transform: currentStep >= 4 ? 'translateX(0)' : 'translateX(-20px)',
                borderColor: currentStep >= 4 ? "rgba(254, 72, 71, 0.3)" : "rgba(229, 231, 235, 0.2)",
                transitionDelay: '0.3s'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={currentStep >= 4 ? 'animate-spin' : ''}>
                    <div className="text-primary">
                      {currentStep >= 4 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm">다음 단계</div>
                    <div className="text-xs text-muted-foreground">
                      {currentStep >= 4 ? '이메일로 안내 발송' : '준비 중...'}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  currentStep >= 4
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep >= 4 ? '준비됨' : '대기'}
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className={`space-y-2 transition-all duration-600 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="hover:scale-105 active:scale-95 transition-transform">
              <Link
                href="/"
                className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-center hover:bg-primary/90 transition-colors text-sm"
              >
                메인 페이지로 돌아가기
              </Link>
            </div>

            <div className="hover:scale-105 active:scale-95 transition-transform">
              <button
                onClick={() => router.back()}
                className="block w-full py-3 px-4 border border-border rounded-lg font-medium hover:bg-secondary transition-colors text-sm"
              >
                이전 페이지로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}