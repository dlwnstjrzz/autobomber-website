"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrdersPage() {
  const [trialData, setTrialData] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 인증 로딩 중에는 리다이렉트하지 않음
    if (authLoading) return;

    if (!user) {
      const redirectPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/orders";
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    fetchOrderData();
  }, [user, authLoading, router]);

  const fetchOrderData = async () => {
    try {
      // 체험 상태 조회
      const trialResponse = await fetch("/api/trial/status");
      const trialData = await trialResponse.json();

      if (trialData.hasTrial) {
        setTrialData(trialData.trial);
      }

      // 라이센스 목록 조회
      const licensesResponse = await fetch("/api/licenses");
      const licensesData = await licensesResponse.json();

      if (licensesData.success) {
        setLicenses(licensesData.licenses);
      }
    } catch (error) {
      console.error("주문 데이터 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다!");
  };

  const formatTimeLeft = (remainingTime) => {
    if (remainingTime <= 0) return "만료됨";

    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  const formatExpiryDate = (dateString, isYearly) => {
    const date = new Date(dateString);
    if (isYearly) {
      return date.toLocaleDateString("ko-KR");
    } else {
      return (
        date.toLocaleDateString("ko-KR") +
        " " +
        date.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-4">주문 내역을 불러오고 있어요</p>
          <img
            src="/image/loadingSpinner.gif"
            alt="Loading..."
            className="w-40 h-40 mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-center mb-4">주문 조회</h1>
          <p className="text-center text-muted-foreground">
            구매하신 상품과 활성화 코드를 확인하세요
          </p>
        </div>

        {/* 주문 리스트 */}
        <div className="max-w-4xl mx-auto">
          {!trialData && licenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                <svg
                  className="w-10 h-10 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">
                주문 내역이 없습니다
              </h2>
              <p className="text-muted-foreground mb-6">
                아직 주문한 상품이 없습니다.
              </p>
              <button
                onClick={() => router.push("/")}
                className="border border-border px-6 py-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground"
              >
                상품 보러가기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 1년 이용권 목록 */}
              {licenses.map((license) => (
                <div
                  key={license.orderId}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <video
                          src="/video/blogAutoThumb.mp4"
                          autoPlay
                          loop
                          muted
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground text-sm sm:text-base">
                          서이추 블로그 자동화 프로그램
                        </h3>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          1년 이용권
                        </p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          239,000 / 1개
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full sm:flex sm:items-center sm:gap-6 sm:w-auto sm:ml-auto">
                      <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground mb-1">
                          제품 코드
                        </p>
                        <div
                          className="font-mono text-sm sm:text-base font-medium text-card-foreground cursor-pointer hover:text-blue-600 transition-colors break-all"
                          onClick={() => copyToClipboard(license.code)}
                        >
                          {license.code}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground mb-1">
                          만료일
                        </p>
                        <p className="text-sm sm:text-base font-medium text-card-foreground leading-tight break-words">
                          {formatExpiryDate(license.expiresAt, false)}
                        </p>
                      </div>
                      <div className="col-span-2 flex justify-center sm:col-span-1 sm:justify-end">
                        <span
                          className={`text-sm sm:text-base font-medium ${
                            license.isExpired
                              ? "text-[#F43099]"
                              : "text-[#615EFF]"
                          }`}
                        >
                          {license.isExpired ? "만료됨" : "이용중"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 무료 체험 */}
              {trialData && (
                <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <video
                          src="/video/blogAutoThumb.mp4"
                          autoPlay
                          loop
                          muted
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground text-sm sm:text-base">
                          서이추 블로그 자동화 프로그램
                        </h3>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          1일 무료체험
                        </p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          무료 / 1개
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full sm:flex sm:items-center sm:gap-6 sm:w-auto sm:ml-auto">
                      <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground mb-1">
                          체험 코드
                        </p>
                        <div
                          className="font-mono text-sm sm:text-base font-medium text-card-foreground cursor-pointer hover:text-blue-600 transition-colors break-all"
                          onClick={() => copyToClipboard(trialData.code)}
                        >
                          {trialData.code}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground mb-1">
                          만료일
                        </p>
                        <p className="text-sm sm:text-base font-medium text-card-foreground leading-tight break-words">
                          {formatExpiryDate(trialData.expiresAt, false)}
                        </p>
                      </div>
                      <div className="col-span-2 flex justify-center sm:col-span-1 sm:justify-end">
                        <span
                          className={`text-sm sm:text-base font-medium ${
                            trialData.isExpired
                              ? "text-[#F43099]"
                              : "text-[#00D3BB]"
                          }`}
                        >
                          {trialData.isExpired ? "만료됨" : "체험중"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
