"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaApple, FaWindows, FaCrown } from "react-icons/fa";

export default function TrialComponent({
  trialCode,
  trialError,
  onTrialSuccess,
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [trialData, setTrialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (trialError) {
      // 에러가 있는 경우 (이미 체험 사용한 계정 등)
      setTrialData({ error: decodeURIComponent(trialError) });
      setIsLoading(false);
    } else if (trialCode) {
      // 체험 코드가 있는 경우 - 체험 정보 가져오기
      fetchTrialData(trialCode);
    } else {
      // 둘 다 없는 경우 - 에러 처리
      setTrialData({ error: "잘못된 접근입니다." });
      setIsLoading(false);
    }
  }, [trialCode, trialError]);

  const fetchTrialData = async (code) => {
    try {
      setIsLoading(true);

      // 체험 코드로 체험 정보 조회
      const response = await fetch(`/api/trial/${code}`);
      const data = await response.json();

      if (data.success) {
        setTrialData(data.trial);
        if (onTrialSuccess) {
          onTrialSuccess(data.trial);
        }
      } else {
        setTrialData({
          error: data.error || "체험 정보를 가져올 수 없습니다.",
        });
      }
    } catch (error) {
      console.error("체험 정보 조회 오류:", error);
      setTrialData({ error: "체험 정보 조회 중 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!trialData || trialData.error) return;

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(trialData.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("만료됨");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [trialData]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-4">
            체험 코드 생성 중...
          </p>
          <img
            src="/image/loadingSpinner.gif"
            alt="Loading..."
            className="w-40 h-40 mx-auto"
          />
        </div>
      </div>
    );
  }

  if (!trialData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            체험 생성 실패
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            체험 코드 생성에 실패했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 에러가 있는 경우 (이미 체험을 사용한 계정 등)
  if (trialData.error) {
    return (
      <div className="max-w-md mx-auto">
        {/* 상단 메시지 */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={4}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            무료 체험 완료되었습니다.
          </h2>
          <p className="text-white font-semibold mb-2">
            지금 당장 특가로 만나보세요!
          </p>
          <p className="text-white text-sm opacity-80">
            무료 체험은 계정당 한번만 가능합니다
          </p>
        </div>

        {/* 그라디언트 보더 컨테이너 */}
        <div className="p-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl">
          {/* 특가 할인 헤더 */}
          <div className="bg-gradient-to-r from-purple-400 to-blue-400 rounded-t-xl p-4 text-center">
            <div className="text-white text-base font-semibold">특가 할인</div>
          </div>

          {/* 메인 카드 */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-b-xl rounded-t-lg p-6 text-white relative overflow-hidden">
            {/* 할인 배지 */}
            <div className="absolute top-4 right-4">
              <div className="bg-purple-500 rounded-full px-4 py-2 text-sm font-bold">
                57% 할인
              </div>
            </div>

            {/* 아이콘 */}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <FaCrown className="w-6 h-6 text-white" />
            </div>

            {/* 플랜 이름 */}
            <h3 className="text-xl font-bold mb-2">1년 이용권</h3>
            <p className="text-gray-300 text-sm mb-4">
              모든 기능을 무제한으로 이용하세요
            </p>

            {/* 가격 */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">₩239,000</span>
                <span className="text-lg text-gray-400 line-through">
                  ₩550,000
                </span>
              </div>
            </div>

            {/* 기능 목록 */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3"></div>
                <span>무제한 자동화 실행</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3"></div>
                <span>우선 고객 지원</span>
              </div>
            </div>

            {/* 구매 버튼 */}
            <button
              onClick={() => router.push("/purchase?plan=yearly")}
              className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              지금 구매하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl shadow-sm border border-gray-200 p-6"
      style={{ backgroundColor: "#FEFEFE" }}
    >
      <div className="text-center mb-6">
        <div
          className="w-32 mx-auto mb-4"
          style={{
            height: "126px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <video
            src="/video/Success.webm"
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "130px",
              objectFit: "cover",
              position: "absolute",
              top: "0",
              left: "0",
            }}
          >
            성공 애니메이션
          </video>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          체험 코드 생성 완료!
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* 프로그램 다운로드 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">프로그램 다운로드</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm text-gray-700"
              onClick={() => alert("Windows용 다운로드 준비중")}
            >
              <FaWindows className="w-4 h-4 mr-2 text-blue-600" />
              Windows
            </button>
            <button
              className="flex items-center justify-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-sm text-gray-700"
              onClick={() => alert("Mac용 다운로드 준비중")}
            >
              <FaApple className="w-4 h-4 mr-2 text-gray-700" />
              macOS
            </button>
          </div>
        </div>

        {/* 체험 코드 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">체험 코드</h3>
          <div
            className="bg-gray-50 rounded-lg p-3 text-center border-2 border-dashed border-green-300 cursor-pointer hover:bg-green-50 hover:border-green-400 transition-colors"
            onClick={() => copyToClipboard(trialData.code)}
          >
            <div className="text-xl font-bold font-mono text-gray-900 mb-1">
              {trialData.code}
            </div>
            <div className="text-xs text-green-600 font-medium">
              클릭하여 복사
            </div>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">안내사항</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• 프로그램에서 위 코드를 입력하여 사용</li>
            <li>• 주문조회 페이지에서 코드 재확인 가능</li>
            <li>• 코드 미등록시에도 시간 차감됨</li>
          </ul>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex-1 bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          홈으로 돌아가기
        </button>
        <button
          onClick={() => router.push("/orders")}
          className="flex-1 border border-gray-300 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm text-gray-700"
        >
          주문조회
        </button>
      </div>
    </div>
  );
}
