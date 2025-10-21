"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

function formatCurrency(value) {
  if (!value) return "₩0";
  return `₩${Number(value).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminReferralPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [totalReward, setTotalReward] = useState(0);
  const [totalUsageCount, setTotalUsageCount] = useState(0);
  const [totalPendingWithdrawals, setTotalPendingWithdrawals] = useState(0);
  const [totalWithdrawnAmount, setTotalWithdrawnAmount] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [processingMap, setProcessingMap] = useState({});

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const redirectPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/admin/referrals";
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    fetchReferralList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchReferralList = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/referrals/list");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "추천인 목록을 불러오지 못했습니다.");
      }

      const referralList = data.referrals || [];
      setReferrals(referralList);
      setTotalReward(data.totalReward || 0);
      setTotalUsageCount(data.totalUsageCount || 0);
      setTotalPendingWithdrawals(data.totalPendingWithdrawals || 0);
      setTotalWithdrawnAmount(data.totalWithdrawnAmount || 0);

      const pendingList = [];
      referralList.forEach((ref) => {
        (ref.withdrawalRequests || []).forEach((req) => {
          if ((req.status ?? 'pending') === 'pending') {
            pendingList.push({
              ...req,
              ownerName: ref.ownerName,
              ownerEmail: ref.ownerEmail,
              code: ref.code,
            });
          }
        });
      });

      pendingList.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setPendingWithdrawals(pendingList);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-4">
            추천인 데이터를 불러오는 중입니다
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

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md bg-card border border-border rounded-xl p-6">
          <h1 className="text-2xl font-semibold mb-4">접근이 제한되었습니다</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  const handleProcessWithdrawal = async (withdrawalId, status) => {
    if (!withdrawalId || !['completed', 'rejected'].includes(status)) {
      return;
    }

    const confirmMessage =
      status === 'completed'
        ? '해당 출금 신청을 완료 처리하시겠습니까?'
        : '해당 출금 신청을 반려하시겠습니까?';

    if (typeof window !== "undefined" && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessingMap((prev) => ({ ...prev, [withdrawalId]: true }));
      const response = await fetch(`/api/referrals/withdrawals/${withdrawalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "출금 신청 처리에 실패했습니다.");
      }

      toast.success(status === 'completed' ? '출금 완료 처리되었습니다.' : '출금 요청이 반려되었습니다.');
      await fetchReferralList();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setProcessingMap((prev) => {
        const updated = { ...prev };
        delete updated[withdrawalId];
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">추천인 관리자 페이지</h1>
            <p className="text-muted-foreground">
              추천인 코드별 적립 현황을 확인할 수 있습니다.
            </p>
          </div>
          <button
            onClick={fetchReferralList}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
          >
            새로고침
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">총 적립금</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(totalReward)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">총 추천인 사용 건수</p>
            <p className="text-3xl font-bold mt-2">{totalUsageCount.toLocaleString()}건</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">출금 대기 금액</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(totalPendingWithdrawals)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">출금 완료 금액</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(totalWithdrawnAmount)}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl mt-8 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">출금 신청 현황</h2>
              <p className="text-sm text-muted-foreground">
                대기 중인 출금 신청을 확인하고 완료 또는 반려 처리할 수 있습니다.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              대기 중: {pendingWithdrawals.length}건
            </div>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
              현재 대기 중인 출금 신청이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((item) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between bg-background/80"
                >
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.ownerName} ({item.ownerEmail || "이메일 없음"})
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      추천인 코드: {item.code}
                    </p>
                    <p className="font-semibold">
                      출금 신청 금액 {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      신청 시간: {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcessWithdrawal(item.id, 'rejected')}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={processingMap[item.id]}
                    >
                      {processingMap[item.id] ? '처리 중...' : '반려'}
                    </button>
                    <button
                      onClick={() => handleProcessWithdrawal(item.id, 'completed')}
                      className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={processingMap[item.id]}
                    >
                      {processingMap[item.id] ? '처리 중...' : '출금 완료'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    추천인 코드
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    계정 정보
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    총 적립금
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    출금 가능
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    출금 대기
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    사용 횟수
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    최근 출금 신청
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    최근 적립
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                      아직 등록된 추천인 코드가 없습니다.
                    </td>
                  </tr>
                ) : (
                  referrals.map((item, index) => {
                    const pendingAmount = Number(item.pendingWithdrawalAmount || 0);
                    const totalAmount = Number(item.totalReward || 0);
                    const availableAmount = Math.max(totalAmount - pendingAmount, 0);
                    const latestWithdrawal = item.latestWithdrawal;

                    return (
                      <tr key={item.code} className="hover:bg-muted/50 transition">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold tracking-wide">
                          {item.code}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">{item.ownerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.ownerEmail || item.userId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {formatCurrency(totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatCurrency(availableAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatCurrency(pendingAmount)}
                          {item.hasPendingWithdrawal && (
                            <span className="ml-2 text-xs text-amber-500 font-medium">
                              대기중
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.usageCount?.toLocaleString() || "0"}회
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {latestWithdrawal ? (
                            <div className="space-y-1">
                              <div className="font-medium">
                                {formatCurrency(latestWithdrawal.amount)}
                              </div>
                              <div
                                className={`text-xs font-semibold ${
                                  latestWithdrawal.status === "completed"
                                    ? "text-green-500"
                                    : latestWithdrawal.status === "rejected"
                                    ? "text-red-500"
                                    : "text-amber-500"
                                }`}
                              >
                                {latestWithdrawal.status === "completed"
                                  ? "완료"
                                  : latestWithdrawal.status === "rejected"
                                  ? "반려"
                                  : "진행 중"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(latestWithdrawal.createdAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              신청 내역 없음
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(item.lastRewardedAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
