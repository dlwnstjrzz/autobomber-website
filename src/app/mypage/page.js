"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState(null);
  const [totalReward, setTotalReward] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [hasUsedReferralDiscount, setHasUsedReferralDiscount] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingWithdrawalAmount, setPendingWithdrawalAmount] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [referralUsages, setReferralUsages] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    accountNumber: "",
    accountHolder: "",
  });

  const formatCurrency = (value) => `₩${Number(value || 0).toLocaleString()}`;

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      const redirectPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/mypage";
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    fetchReferralInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchReferralInfo = async () => {
    try {
      const response = await fetch("/api/referrals/me");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "추천인 정보를 불러오지 못했습니다.");
      }

      setReferral(data.referral);
      setTotalReward(data.totalReward || 0);
      setUsageCount(data.usageCount || 0);
      setPendingWithdrawalAmount(data.pendingWithdrawalAmount || 0);
      setWithdrawnAmount(data.withdrawnAmount || 0);
      setReferralUsages(Array.isArray(data.referralUsages) ? data.referralUsages : []);
      setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
      setHasUsedReferralDiscount(Boolean(data.hasUsedReferralDiscount));
    } catch (error) {
      console.error(error);
      toast.error("추천인 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReferralCode = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/referrals/generate", {
        method: "POST",
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "추천인 코드를 생성하지 못했습니다.");
      }

      setReferral(data.referral);
      toast.success("추천인 코드가 준비되었습니다.");
      setTotalReward(data.referral.totalReward || 0);
      setUsageCount(data.referral.usageCount || 0);
      setPendingWithdrawalAmount(data.referral.pendingWithdrawalAmount || 0);
      setWithdrawnAmount(data.referral.withdrawnAmount || 0);
      setReferralUsages([]);
      setWithdrawals([]);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const availableBalance = Math.max(totalReward - pendingWithdrawalAmount - withdrawnAmount, 0);

  const handleCopyCode = async () => {
    if (!referral?.code) return;
    try {
      await navigator.clipboard.writeText(referral.code);
      toast.success("추천인 코드가 복사되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error("코드 복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  const openWithdrawalModal = () => {
    if (!referral) {
      toast.error("추천인 코드를 먼저 생성해주세요.");
      return;
    }

    if (availableBalance <= 0) {
      toast.error("출금 가능한 적립금이 없습니다.");
      return;
    }

    setWithdrawalForm((prev) => ({
      amount: prev.amount || String(Math.max(Math.floor(availableBalance), 0)),
      accountNumber: prev.accountNumber,
      accountHolder: prev.accountHolder,
    }));

    setIsWithdrawalModalOpen(true);
  };

  const closeWithdrawalModal = () => {
    setIsWithdrawalModalOpen(false);
    setWithdrawalForm({ amount: "", accountNumber: "", accountHolder: "" });
  };

  const handleWithdrawalInputChange = (field) => (event) => {
    const { value } = event.target;
    setWithdrawalForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitWithdrawal = async () => {
    if (isSubmittingWithdrawal) return;

    const amountValue = Number(withdrawalForm.amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error("유효한 출금 금액을 입력해주세요.");
      return;
    }

    if (amountValue > availableBalance) {
      toast.error("출금 가능 금액을 초과했습니다.");
      return;
    }

    if (!withdrawalForm.accountNumber || withdrawalForm.accountNumber.length < 6) {
      toast.error("정확한 계좌번호를 입력해주세요.");
      return;
    }

    if (!withdrawalForm.accountHolder) {
      toast.error("예금주를 입력해주세요.");
      return;
    }

    try {
      setIsSubmittingWithdrawal(true);
      const response = await fetch("/api/referrals/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountValue,
          accountNumber: withdrawalForm.accountNumber,
          accountHolder: withdrawalForm.accountHolder,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "출금 신청에 실패했습니다.");
      }

      toast.success("출금 신청이 접수되었습니다.");
      setWithdrawalForm({ amount: "", accountNumber: "", accountHolder: "" });
      closeWithdrawalModal();
      fetchReferralInfo();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-4">
            마이페이지를 불러오는 중입니다
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">
            추천인 코드와 적립 현황을 확인하세요.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="bg-card text-card-foreground border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">추천인 코드</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  추천인 코드는 계정당 1개만 생성되며 수정하거나 삭제할 수
                  없습니다.
                </p>
              </div>
              {!referral && (
                <button
                  onClick={handleGenerateReferralCode}
                  disabled={isGenerating}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "생성 중..." : "추천인 코드 받기"}
                </button>
              )}
            </div>

            {referral ? (
              <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    내 추천인 코드
                  </p>
                  <p className="text-2xl font-bold tracking-widest">
                    {referral.code}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {usageCount > 0
                      ? `총 ${usageCount}명이 추천인 코드를 사용했습니다.`
                      : "아직 추천인 코드 사용 기록이 없습니다."}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-white text-black rounded-md font-medium border border-border hover:bg-gray-100 transition"
                >
                  코드 복사
                </button>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4 text-muted-foreground">
                <p>아직 추천인 코드가 없습니다. 위 버튼을 눌러 생성하세요.</p>
              </div>
            )}
          </section>

          <section className="bg-card text-card-foreground border border-border rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-semibold mb-1">추천인 적립금</h2>
                <p className="text-sm text-muted-foreground">
                  내 추천인 코드를 사용한 결제 금액의 10%가 적립되며, 계정당 원하는 금액만큼 출금 신청할 수 있습니다.
                </p>
              </div>
              {referral && (
                <button
                  onClick={openWithdrawalModal}
                  className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={availableBalance <= 0 || isSubmittingWithdrawal}
                >
                  출금하기
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">총 적립 금액</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(totalReward)}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">출금 대기 금액</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(pendingWithdrawalAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  관리자 확인 후 순차적으로 처리됩니다.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">이미 출금 완료</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatCurrency(withdrawnAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  완료된 출금 신청의 누적 금액입니다.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">출금 가능 금액</p>
                <p className="text-2xl font-semibold mt-1 text-green-500">
                  {formatCurrency(availableBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  출금 가능 = 총 적립금 - 출금 대기 - 출금 완료.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card text-card-foreground border border-border rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">추천인 결제 내역</h2>
              <p className="text-sm text-muted-foreground mt-1">
                내 추천인 코드를 사용해 결제된 내역을 확인할 수 있습니다.
              </p>
            </div>

            {referralUsages.length > 0 ? (
              <div className="space-y-3">
                {referralUsages.map((usage) => (
                  <div
                    key={usage.id}
                    className="border border-border rounded-lg p-4 bg-background/80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          주문번호: {usage.orderId || "-"}
                        </p>
                        <p className="text-lg font-semibold">
                          결제 금액 {formatCurrency(usage.amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-semibold">
                          적립 {formatCurrency(usage.rewardAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(usage.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
                아직 추천인 결제 내역이 없습니다.
              </div>
            )}
          </section>

          <section className="bg-card text-card-foreground border border-border rounded-xl p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">출금 신청 내역</h2>
              <p className="text-sm text-muted-foreground mt-1">
                최근 출금 신청 기록과 처리 상태를 확인하세요.
              </p>
            </div>

            {withdrawals.length > 0 ? (
              <div className="space-y-3">
                {withdrawals.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-4 bg-background/80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          출금 신청 {formatCurrency(request.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          계좌: {request.accountNumber || "-"} / 예금주: {request.accountHolder || "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            request.status === "completed"
                              ? "text-green-500"
                              : request.status === "rejected"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}
                        >
                          {request.status === "completed"
                            ? "출금 완료"
                            : request.status === "rejected"
                            ? "반려됨"
                            : "진행 중"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          신청: {formatDateTime(request.createdAt)}
                        </p>
                        {request.processedAt && (
                          <p className="text-xs text-muted-foreground">
                            처리: {formatDateTime(request.processedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
                아직 출금 신청 기록이 없습니다.
              </div>
            )}
          </section>

          {hasUsedReferralDiscount && (
            <section className="bg-card text-card-foreground border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">추천인 할인 사용 안내</h2>
              <p className="text-sm text-muted-foreground">
                이미 추천인 코드를 사용해 5% 할인을 받았습니다. 추천인 할인은
                계정당 1회만 제공됩니다.
              </p>
            </section>
          )}
        </div>
      </div>

      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-lg w-full border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">출금 신청</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  출금 받으실 정보를 정확하게 입력해주세요.
                </p>
              </div>
              <button
                onClick={closeWithdrawalModal}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">출금 금액</label>
                <input
                  type="number"
                  min={1}
                  value={withdrawalForm.amount}
                  onChange={handleWithdrawalInputChange("amount")}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="출금 금액을 입력하세요"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  출금 가능 금액: {formatCurrency(availableBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">계좌번호</label>
                <input
                  type="text"
                  value={withdrawalForm.accountNumber}
                  onChange={handleWithdrawalInputChange("accountNumber")}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="예) 123456-78-901234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">예금주</label>
                <input
                  type="text"
                  value={withdrawalForm.accountHolder}
                  onChange={handleWithdrawalInputChange("accountHolder")}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  placeholder="예금주 이름을 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeWithdrawalModal}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition"
                disabled={isSubmittingWithdrawal}
              >
                취소
              </button>
              <button
                onClick={handleSubmitWithdrawal}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmittingWithdrawal}
              >
                {isSubmittingWithdrawal ? "신청 중..." : "출금 신청하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
