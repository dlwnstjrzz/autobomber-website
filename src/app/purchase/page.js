"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NicePayment from "@/components/NicePayment";
import TrialComponent from "@/components/TrialComponent";

export default function PurchasePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: user?.email || "",
  });

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

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setUserInfo((prev) => ({ ...prev, email: user.email }));
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    if (!userInfo.name || !userInfo.phone || !userInfo.email) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    // 무료 체험의 경우 별도 처리
    if (currentPlan.price === 0) {
      // 무료 체험 로직 처리
      alert("무료 체험이 시작되었습니다!");
      router.push("/purchase/success?plan=trial");
      return;
    }

    setIsProcessing(true);

    try {
      console.log("결제 준비 요청 시작...");

      const response = await fetch("/api/payment/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: currentPlan.price,
          goodsName: `블로그 서이추 자동화 - ${currentPlan.name}`,
          buyerName: userInfo.name,
          buyerTel: userInfo.phone,
          buyerEmail: userInfo.email,
        }),
      });

      const result = await response.json();
      console.log("결제 준비 응답:", result);

      if (result.success) {
        console.log("결제 데이터 설정:", result.paymentData);
        setPaymentData(result.paymentData);
      } else {
        throw new Error(result.error || "결제 준비 실패");
      }
    } catch (error) {
      console.error("결제 준비 실패:", error);
      alert(`결제 준비 중 오류가 발생했습니다: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log("결제 성공 처리");
    setIsProcessing(false);
    setPaymentData(null);
    router.push("/purchase/success");
  };

  const handlePaymentFailure = (error) => {
    console.log("결제 실패 처리:", error);
    setIsProcessing(false);
    setPaymentData(null);
    alert(`결제 실패: ${error}`);
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
              {/* 선택한 상품 정보 */}
              <div className="bg-card text-card-foreground rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">선택한 상품</h2>
                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground mt-2">
                    {currentPlan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-primary">
                      {currentPlan.price === 0
                        ? "무료"
                        : `₩${currentPlan.price.toLocaleString()}`}
                    </span>
                    {plan === "yearly" && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        ₩550,000
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 구매자 정보 입력 */}
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
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder="email@example.com"
                      required
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* 결제 버튼 */}
              <div className="text-center">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90"
                  } text-white`}
                >
                  {isProcessing
                    ? "결제 처리 중..."
                    : `₩${currentPlan.price.toLocaleString()} 결제하기`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 나이스페이 결제 컴포넌트 */}
      {paymentData && (
        <NicePayment
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
}
