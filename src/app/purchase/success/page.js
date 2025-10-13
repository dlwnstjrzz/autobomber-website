"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const plan = searchParams.get('plan');

  const [animationPhase, setAnimationPhase] = useState('initial'); // initial, shrink, details
  const [activationCode, setActivationCode] = useState('');

  useEffect(() => {
    console.log('결제 성공:', { orderId, amount, plan });

    // 활성화 코드 조회
    fetchActivationCode();

    // 1초 후 체크 애니메이션 축소 및 위로 이동
    const shrinkTimer = setTimeout(() => {
      setAnimationPhase('shrink');
    }, 1000);

    // 애니메이션 완료 후 상세 정보 표시
    const detailsTimer = setTimeout(() => {
      setAnimationPhase('details');
    }, 1500);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(detailsTimer);
    };
  }, [orderId, amount, plan]);

  const fetchActivationCode = async () => {
    try {
      if (plan === 'trial') {
        // 무료 체험 코드 조회
        const response = await fetch('/api/trial/status');
        const data = await response.json();

        if (data.hasTrial && data.trial.code) {
          setActivationCode(data.trial.code);
        }
      } else if (plan === 'yearly') {
        // 1년 이용권 코드 조회 (주문번호 기반)
        if (orderId) {
          const response = await fetch(`/api/license/${orderId}`);
          const data = await response.json();

          if (data.success && data.license.code) {
            setActivationCode(data.license.code);
          }
        }
      }
    } catch (error) {
      console.error('활성화 코드 조회 오류:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("복사가 완료되었습니다!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: "#FEFEFE"}}>
      <div className="w-full max-w-md mx-auto">
        {/* 상단 텍스트 */}
        <div className="text-center mb-8">
          <div className="mb-2">
            <img
              src="/image/logoText.svg"
              alt="Logo"
              className="h-6 mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">결제 완료!</h2>
        </div>

        {/* 메인 애니메이션 영역 */}
        <div className="relative flex flex-col items-center">
          {/* Success 비디오 - 초기에는 크게, 1초 후 작아지면서 위로 이동 */}
          <div
            className={`transition-all duration-700 ease-out ${
              animationPhase === 'initial'
                ? 'w-80 h-80 mb-8'
                : 'w-32 h-32 mb-6 -translate-y-4'
            }`}
          >
            <video
              src="/video/Success.webm"
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-full"
              style={{
                clipPath: 'circle(50%)'
              }}
            >
              성공 애니메이션
            </video>
          </div>

          {/* 상세 정보 카드 - 애니메이션 완료 후 페이드인 */}
          <div
            className={`w-full bg-white rounded-2xl shadow-lg p-6 transition-all duration-700 ${
              animationPhase === 'details'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            {/* 결제 정보 */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">결제 상태</span>
                <span className="font-semibold" style={{color: "#F43099"}}>완료</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">플랜</span>
                <span className="font-semibold text-gray-900">
                  {plan === 'yearly' ? '1년 이용권' : '무료 체험'}
                </span>
              </div>

              {amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">결제 금액</span>
                  <span className="font-bold text-gray-900 text-lg">
                    ₩{Number(amount).toLocaleString()}
                  </span>
                </div>
              )}

              {orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-mono text-sm text-gray-900">{orderId}</span>
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* 사용 가이드 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">📖 사용 가이드</h3>
              <Link
                href="/guide"
                className="flex items-center justify-center w-full py-3 px-4 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                style={{backgroundColor: "#615EFF"}}
              >
                프로그램 사용법 및 설정 가이드 보기
              </Link>
            </div>

            {/* 프로그램 다운로드 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">💻 프로그램 다운로드</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.open('/download/windows', '_blank')}
                  className="flex items-center justify-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <img
                    src="/image/windowLogo.png"
                    alt="Windows"
                    className="w-5 h-5 mr-2"
                  />
                  Windows
                </button>
                <button
                  onClick={() => window.open('/download/mac', '_blank')}
                  className="flex items-center justify-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  macOS
                </button>
              </div>
            </div>

            {/* 활성화 코드 */}
            {activationCode && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">🔑 프로그램 활성화 코드</h3>
                <div
                  className="bg-gray-50 rounded-lg p-3 text-center border-2 border-dashed cursor-pointer hover:bg-opacity-10 transition-colors"
                  style={{borderColor: "#615EFF", hover: {backgroundColor: "#615EFF"}}}
                  onClick={() => copyToClipboard(activationCode)}
                >
                  <div className="text-xl font-bold font-mono text-gray-900 mb-1">
                    {activationCode}
                  </div>
                  <div className="text-xs font-medium" style={{color: "#615EFF"}}>
                    클릭하여 복사
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center" style={{backgroundColor: "#FEFEFE"}}>
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-4">결제 정보를 불러오고 있어요</p>
          <img
            src="/image/loadingSpinner.gif"
            alt="Loading..."
            className="w-40 h-40 mx-auto"
          />
        </div>
      </div>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  );
}