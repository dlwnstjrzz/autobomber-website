"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrdersPage() {
  const [trialData, setTrialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 인증 로딩 중에는 리다이렉트하지 않음
    if (authLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    fetchTrialStatus();
  }, [user, authLoading, router]);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/trial/status');
      const data = await response.json();

      if (data.hasTrial) {
        setTrialData(data.trial);
      }
    } catch (error) {
      console.error('체험 상태 조회 오류:', error);
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
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">주문 조회</h1>

        {!trialData ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">주문 내역이 없습니다</h2>
            <p className="text-muted-foreground mb-6">아직 주문한 상품이 없습니다.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              상품 보러가기
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">무료 체험</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                trialData.isExpired
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-green-50 text-green-700'
              }`}>
                {trialData.isExpired ? '만료됨' : '진행중'}
              </span>
            </div>

            <div className="space-y-4">
              {/* 체험 코드 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">체험 코드</h3>
                <div
                  className="bg-gray-50 rounded-lg p-3 text-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => copyToClipboard(trialData.code)}
                >
                  <div className="text-xl font-bold font-mono text-gray-900 mb-1">
                    {trialData.code}
                  </div>
                  <div className="text-xs text-gray-500">
                    클릭하여 복사
                  </div>
                </div>
              </div>

              {/* 유효기간 */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">남은 시간</h3>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {formatTimeLeft(trialData.remainingTime)}
                  </div>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">생성일</span>
                    <div className="font-medium text-gray-900">{new Date(trialData.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">만료일</span>
                    <div className="font-medium text-gray-900">{new Date(trialData.expiresAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* 안내사항 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">안내사항</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 프로그램에서 위 코드를 입력하여 사용</li>
                  <li>• 코드 미등록시에도 시간 차감됨</li>
                  <li>• 체험 기간 중 모든 기능 사용 가능</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}