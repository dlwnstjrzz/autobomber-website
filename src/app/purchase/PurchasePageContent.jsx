"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import TrialComponent from "@/components/TrialComponent";

function PurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const plan = searchParams.get("plan") || "yearly";
  const trialCode = searchParams.get("code");
  const trialError = searchParams.get("error");
  const discountCodeFromQuery = (
    searchParams.get("discountCode") || ""
  ).toUpperCase();

  const [referralInput, setReferralInput] = useState("");
  const [referralDiscount, setReferralDiscount] = useState(null);
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [referralError, setReferralError] = useState(null);

  const [discountInput, setDiscountInput] = useState(discountCodeFromQuery);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState(null);

  const hasAutoAppliedDiscount = useRef(false);
  const lastReferralBasePriceRef = useRef(null);

  const planInfo = {
    trial: {
      name: "1일 무료 체험",
      price: 0,
      description: "1일 동안 모든 기능을 무료로 체험해보세요",
    },
    yearly: {
      name: "1년 이용권",
      price: 239000,
      description: "1년 동안 무제한으로 이용 가능 (57% 할인)",
    },
  };

  const currentPlan = planInfo[plan] || planInfo.yearly;

  const couponAmount = useMemo(() => {
    if (!discountInfo || discountInfo.isExpired) return 0;

    if (typeof discountInfo.discountAmount === "number") {
      return Math.min(
        currentPlan.price,
        Math.max(0, Math.floor(discountInfo.discountAmount))
      );
    }

    if (typeof discountInfo.discountedPrice === "number") {
      const inferred = currentPlan.price - discountInfo.discountedPrice;
      return Math.min(currentPlan.price, Math.max(0, Math.floor(inferred)));
    }

    return 0;
  }, [discountInfo, currentPlan.price]);

  const priceAfterCoupon = useMemo(
    () => Math.max(0, currentPlan.price - couponAmount),
    [currentPlan.price, couponAmount]
  );

  const referralAmount = useMemo(() => {
    if (!referralDiscount?.discountAmount) return 0;
    return Math.min(
      priceAfterCoupon,
      Math.max(0, Math.floor(referralDiscount.discountAmount))
    );
  }, [priceAfterCoupon, referralDiscount]);

  const finalPrice = useMemo(
    () => Math.max(0, priceAfterCoupon - referralAmount),
    [priceAfterCoupon, referralAmount]
  );

  const applyDiscount = useCallback(
    async ({ code, silent = false } = {}) => {
      const targetCode = (code ?? discountInput ?? "").trim().toUpperCase();

      if (!targetCode) {
        if (!silent) {
          toast.error("할인 코드를 입력해주세요.");
        }
        return;
      }

      try {
        setApplyingDiscount(true);
        setDiscountError(null);
        setDiscountInput(targetCode);

        const response = await fetch("/api/discount/status");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "할인 코드 확인에 실패했습니다.");
        }

        if (!data.hasDiscount || !data.discount) {
          throw new Error("사용 가능한 할인 코드가 없습니다.");
        }

        if (data.discount.isExpired) {
          throw new Error("할인 코드가 만료되었습니다.");
        }

        if ((data.discount.code || "").toUpperCase() !== targetCode) {
          throw new Error("해당 할인 코드를 찾을 수 없습니다.");
        }

        setDiscountInfo(data.discount);
        if (!silent) {
          toast.success("할인 코드가 적용되었습니다.");
        }
      } catch (error) {
        console.error(error);
        setDiscountInfo(null);
        setDiscountError(error.message);
        if (!silent) {
          toast.error(error.message);
        }
      } finally {
        setApplyingDiscount(false);
      }
    },
    [discountInput]
  );

  const handleRemoveDiscount = useCallback(() => {
    setDiscountInfo(null);
    setDiscountInput("");
    setDiscountError(null);
    lastReferralBasePriceRef.current = null;
  }, []);

  const applyReferral = useCallback(
    async ({ code, silent = false, skipInputUpdate = false } = {}) => {
      const targetCode = (code ?? referralInput ?? "").trim().toUpperCase();

      if (!targetCode) {
        if (!silent) {
          toast.error("추천인 코드를 입력해주세요.");
        }
        return;
      }

      try {
        setApplyingReferral(true);
        setReferralError(null);
        if (!skipInputUpdate) {
          setReferralInput(targetCode);
        }

        const response = await fetch("/api/referrals/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: targetCode,
            originalPrice: priceAfterCoupon,
            plan,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "추천인 코드 확인에 실패했습니다.");
        }

        setReferralDiscount(data.discount);
        lastReferralBasePriceRef.current = priceAfterCoupon;
        if (!silent) {
          toast.success("추천인 할인이 적용되었습니다.");
        }
      } catch (error) {
        console.error(error);
        setReferralDiscount(null);
        setReferralError(error.message);
        if (!silent) {
          toast.error(error.message);
        } else {
          lastReferralBasePriceRef.current = null;
        }
      } finally {
        setApplyingReferral(false);
      }
    },
    [plan, priceAfterCoupon, referralInput]
  );

  const handleRemoveReferral = useCallback(() => {
    setReferralDiscount(null);
    setReferralInput("");
    setReferralError(null);
    lastReferralBasePriceRef.current = null;
  }, []);

  useEffect(() => {
    if (!user) {
      const redirectPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/purchase?plan=${plan}`;
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [user, router, plan]);

  useEffect(() => {
    if (discountCodeFromQuery) {
      setDiscountInput(discountCodeFromQuery);
    }
  }, [discountCodeFromQuery]);

  useEffect(() => {
    if (!user) return;
    if (!discountCodeFromQuery) return;
    if (hasAutoAppliedDiscount.current) return;

    hasAutoAppliedDiscount.current = true;
    applyDiscount({ code: discountCodeFromQuery, silent: true });
  }, [user, discountCodeFromQuery, applyDiscount]);

  useEffect(() => {
    if (!referralDiscount?.referralCode) {
      lastReferralBasePriceRef.current = null;
      return;
    }

    if (priceAfterCoupon === lastReferralBasePriceRef.current) return;
    lastReferralBasePriceRef.current = priceAfterCoupon;

    applyReferral({
      code: referralDiscount.referralCode,
      silent: true,
      skipInputUpdate: true,
    });
  }, [applyReferral, priceAfterCoupon, referralDiscount?.referralCode]);

  const handlePayment = () => {
    if (currentPlan.price === 0) {
      alert("무료 체험이 시작되었습니다!");
      router.push("/purchase/success?plan=trial");
      return;
    }

    const productInfo = {
      name: `블로그 서이추 자동화 - ${currentPlan.name}`,
      price: finalPrice,
      description: currentPlan.description,
      plan,
      referral: referralDiscount
        ? {
            code: referralDiscount.referralCode,
            referrerName: referralDiscount.referrerName,
            referrerUserId: referralDiscount.referrerUserId,
            originalPrice: referralDiscount.originalPrice,
            discountedPrice: referralDiscount.discountedPrice,
            discountAmount: referralDiscount.discountAmount,
            discountRate: referralDiscount.discountRate,
          }
        : null,
      coupon: discountInfo
        ? {
            code: discountInfo.code,
            discountAmount: couponAmount,
            originalPrice: discountInfo.originalPrice,
            discountedPrice: discountInfo.discountedPrice,
            expiresAt: discountInfo.expiresAt,
          }
        : null,
      priceBreakdown: {
        basePrice: currentPlan.price,
        couponAmount,
        referralAmount,
        finalPrice,
      },
      buyer: {
        email: user?.email || "",
      },
    };

    const queryParams = new URLSearchParams({
      product: JSON.stringify(productInfo),
    });

    router.push(`/buy?${queryParams.toString()}`);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">로그인이 필요합니다</h1>
          <p>결제를 위해 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-lg space-y-6">
          {plan === "trial" ? (
            <section className="rounded-[28px] p-6">
              <TrialComponent
                trialCode={trialCode}
                trialError={trialError}
                onTrialSuccess={(data) => {
                  console.log("체험 시작 성공:", data);
                }}
              />
            </section>
          ) : (
            <>
              <section className="mt-16 rounded-[28px] bg-[#F3F4F6] p-8 shadow-[0_24px_48px_rgba(0,0,0,0.18)]">
                <div className="space-y-7">
                  <header className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B95A1]">
                      주문 요약
                    </p>
                    <h2 className="text-2xl font-semibold text-[#191F28]">
                      {currentPlan.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-[#4E5968]">
                      {currentPlan.description}
                    </p>
                  </header>

                  <div className="rounded-2xl border border-[#ECEFF3] bg-[#F9FAFB] px-4 py-5 text-sm text-[#4E5968]">
                    <div className="flex items-center justify-between">
                      <span>상품 금액</span>
                      <span className="font-medium text-[#191F28]">
                        ₩{currentPlan.price.toLocaleString()}
                      </span>
                    </div>
                    {couponAmount > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <span>할인 코드</span>
                        <span className="font-semibold text-[#F43099]">
                          -₩{couponAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {referralAmount > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <span>추천인 할인</span>
                        <span className="font-semibold text-[#00D3BB]">
                          -₩{referralAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="my-3 h-px bg-[#ECEFF3]" />
                    <div className="flex items-center justify-between text-base font-semibold text-[#191F28]">
                      <span>총 결제 금액</span>
                      <span className="text-[#0164FF]">
                        ₩{finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {discountInfo ? (
                      <div className="flex items-center justify-between rounded-2xl border border-[#ECEFF3] bg-[#F9FAFB] px-5 py-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8B95A1]">
                            할인 코드 적용됨
                          </p>
                          <p className="mt-1 text-base font-semibold text-[#191F28]">
                            #{discountInfo.code}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#F43099]">
                            -₩{couponAmount.toLocaleString()} 즉시 할인
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveDiscount}
                          className="rounded-lg border border-[#ECEFF3] px-4 py-2 text-sm font-medium text-[#4E5968] transition hover:bg-[#F0F2F5]"
                        >
                          코드 제거
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 rounded-2xl border border-[#ECEFF3] px-4 py-3 sm:flex-row sm:items-center">
                        <label className="text-sm font-medium text-[#8B95A1] sm:w-[120px]">
                          할인 코드
                        </label>
                        <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row">
                          <input
                            type="text"
                            value={discountInput}
                            onChange={(e) =>
                              setDiscountInput(e.target.value.toUpperCase())
                            }
                            className="flex-1 rounded-lg border border-transparent bg-white px-4 py-2 text-sm font-medium tracking-wide text-[#191F28] placeholder:text-[#A3ACB8] focus:border-[#615EFF] focus:outline-none focus:ring-2 focus:ring-[#615EFF]/30"
                            placeholder="할인 코드를 입력하세요"
                            maxLength={12}
                          />
                          <button
                            onClick={() => applyDiscount({})}
                            disabled={applyingDiscount}
                            className="inline-flex items-center justify-center rounded-lg bg-[#0164FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                          >
                            {applyingDiscount ? "확인 중..." : "적용"}
                          </button>
                        </div>
                      </div>
                    )}
                    {!discountInfo && discountError && (
                      <p className="text-sm text-[#F43099]">{discountError}</p>
                    )}

                    {referralDiscount ? (
                      <div className="flex items-center justify-between rounded-2xl border border-[#ECEFF3] bg-[#F9FAFB] px-5 py-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8B95A1]">
                            추천인 코드 적용됨
                          </p>
                          <p className="mt-1 text-base font-semibold text-[#191F28]">
                            {referralDiscount.referralCode}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#00D3BB]">
                            -₩{referralAmount.toLocaleString()} 할인 (5%)
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveReferral}
                          className="rounded-lg border border-[#ECEFF3] px-4 py-2 text-sm font-medium text-[#4E5968] transition hover:bg-[#F0F2F5]"
                        >
                          코드 제거
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 rounded-2xl border border-[#ECEFF3] px-4 py-3 sm:flex-row sm:items-center">
                        <label className="text-sm font-medium text-[#8B95A1] sm:w-[120px]">
                          추천인 코드
                        </label>
                        <div className="flex w-full flex-col gap-3 sm:flex-1 sm:flex-row">
                          <input
                            type="text"
                            value={referralInput}
                            onChange={(e) =>
                              setReferralInput(e.target.value.toUpperCase())
                            }
                            className="flex-1 rounded-lg border border-transparent bg-white px-4 py-2 text-sm font-medium tracking-wide text-[#191F28] placeholder:text-[#A3ACB8] focus:border-[#615EFF] focus:outline-none focus:ring-2 focus:ring-[#615EFF]/30"
                            placeholder="추천인 코드를 입력하세요"
                            maxLength={12}
                          />
                          <button
                            onClick={() => applyReferral({})}
                            disabled={applyingReferral}
                            className="inline-flex items-center justify-center rounded-lg bg-[#0164FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                          >
                            {applyingReferral ? "확인 중..." : "적용"}
                          </button>
                        </div>
                      </div>
                    )}
                    {!referralDiscount && referralError && (
                      <p className="text-sm text-[#F43099]">{referralError}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handlePayment}
                      className="w-full mt-8 rounded-2xl bg-[#0164FF] py-4 text-lg font-semibold text-white transition hover:bg-[#0052CC]"
                    >
                      ₩{finalPrice.toLocaleString()} 결제하기
                    </button>
                    <p className="text-center text-xs text-[#8B95A1]">
                      <span className="mr-1 text-[#FCB700]">🔒</span>
                      Toss Payments를 통해 안전하게 결제됩니다.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PurchasePageContent() {
  return <PurchaseContent />;
}
