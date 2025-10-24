'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import TrialComponent from "@/components/TrialComponent";

function PurchaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
  });
  const [referralInput, setReferralInput] = useState("");
  const [referralDiscount, setReferralDiscount] = useState(null);
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [referralError, setReferralError] = useState(null);

  const plan = searchParams.get("plan") || "yearly";
  const trialCode = searchParams.get("code");
  const trialError = searchParams.get("error");

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
  const finalPrice = referralDiscount?.discountedPrice ?? currentPlan.price;
  const discountAmount = referralDiscount?.discountAmount ?? 0;

  useEffect(() => {
    if (!user) {
      const redirectPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/purchase?plan=${plan}`;
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    setUserInfo((prev) => ({ ...prev, email: user.email }));
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = () => {
    if (!userInfo.name || !userInfo.phone) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

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
      buyer: {
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
      },
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
    };

    const queryParams = new URLSearchParams({
      product: JSON.stringify(productInfo),
    });

    router.push(`/buy?${queryParams.toString()}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p>결제를 위해 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) {
      toast.error("추천인 코드를 입력해주세요.");
      return;
    }

    try {
      setApplyingReferral(true);
      setReferralError(null);
      const response = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: referralInput,
          originalPrice: currentPlan.price,
          plan,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "추천인 코드 확인에 실패했습니다.");
      }

      setReferralDiscount(data.discount);
      toast.success("추천인 할인이 적용되었습니다.");
    } catch (error) {
      console.error(error);
      setReferralDiscount(null);
      setReferralError(error.message);
      toast.error(error.message);
    } finally {
      setApplyingReferral(false);
    }
  };

  const handleRemoveReferral = () => {
    setReferralDiscount(null);
    setReferralInput("");
    setReferralError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {plan === "trial" ? (
            <TrialComponent
              trialCode={trialCode}
              trialError={trialError}
              onTrialSuccess={(data) => {
                console.log("체험 시작 성공:", data);
              }}
            />
          ) : (
            <>
              <div className="bg-card text-card-foreground rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">선택한 상품</h2>
                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground mt-2">
                    {currentPlan.description}
                  </p>
                  <div className="mt-4">
                    {discountAmount > 0 ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-muted-foreground line-through">
                          ₩{currentPlan.price.toLocaleString()}
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          ₩{finalPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-500">
                          추천인 할인 -₩{discountAmount.toLocaleString()} (5%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {currentPlan.price === 0
                          ? "무료"
                          : `₩${currentPlan.price.toLocaleString()}`}
                      </span>
                    )}
                    {plan === "yearly" && discountAmount === 0 && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        ₩550,000
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground rounded-lg p-6 mb-8 border border-border">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">추천인 코드</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      추천인 코드를 입력하면 5% 할인을 받을 수 있어요. 계정당
                      1회만 적용됩니다.
                    </p>
                  </div>

                  {referralDiscount ? (
                    <div className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          적용된 추천인 코드
                        </p>
                        <p className="text-xl font-semibold">
                          {referralDiscount.referralCode}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveReferral}
                        className="px-4 py-2 text-sm font-medium bg-white text-black rounded-md border border-border hover:bg-gray-100 transition"
                      >
                        코드 제거
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={referralInput}
                        onChange={(e) =>
                          setReferralInput(e.target.value.toUpperCase())
                        }
                        className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        placeholder="추천인 코드를 입력하세요"
                        maxLength={12}
                      />
                      <button
                        onClick={handleApplyReferral}
                        disabled={applyingReferral}
                        className="px-5 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {applyingReferral ? "확인 중..." : "적용하기"}
                      </button>
                    </div>
                  )}

                  {!referralDiscount && referralError && (
                    <p className="text-sm text-red-500">{referralError}</p>
                  )}
                </div>
              </div>

              <div className="bg-card text-card-foreground rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">구매자 정보</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      이름 *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="이름을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handlePayment}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    "bg-primary hover:bg-primary/90"
                  } text-white`}
                >
                  {`₩${finalPrice.toLocaleString()} 결제하기`}
                </button>
              </div>
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
