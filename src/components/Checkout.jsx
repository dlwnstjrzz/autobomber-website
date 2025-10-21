import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useSearchParams } from "next/navigation";

const generateRandomString = () => window.btoa(Math.random()).slice(0, 20);
const clientKey = "test_gck_Z1aOwX7K8mYJ1e7BWbRP8yQxzvNP";
const fallbackProduct = {
  name: "블로그 서이추 자동화 프로그램",
  price: 239000,
  description: "블로그 서이추 자동화",
  plan: "yearly",
  referral: null,
};

const formatCurrency = (value) =>
  `₩${Number(value || 0).toLocaleString("ko-KR")}`;

function CheckoutContent() {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [productInfo, setProductInfo] = useState(fallbackProduct);
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: fallbackProduct.price,
  });
  const searchParams = useSearchParams();
  const referralInfo = productInfo?.referral;

  // URL 파라미터에서 제품 정보 가져오기
  useEffect(() => {
    const productParam = searchParams.get("product");
    if (productParam) {
      try {
        const product = JSON.parse(productParam);
        setProductInfo(product);
        setAmount({
          currency: "KRW",
          value: product.price,
        });
      } catch (error) {
        console.error("제품 정보 파싱 실패:", error);
        setProductInfo(fallbackProduct);
        setAmount({
          currency: "KRW",
          value: fallbackProduct.price,
        });
      }
    } else {
      setProductInfo(fallbackProduct);
      setAmount({
        currency: "KRW",
        value: fallbackProduct.price,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, [clientKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }

      // DOM 요소 존재 확인
      const paymentElement = document.getElementById("payment-method");
      const agreementElement = document.getElementById("agreement");
      if (!paymentElement || !agreementElement) {
        console.error("DOM 요소가 존재하지 않습니다");
        return;
      }

      try {
        /**
         * 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
         * renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 선행되어야 합니다.
         * @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
         */
        await widgets.setAmount(amount);

        await Promise.all([
          /**
           * 결제창을 렌더링합니다.
           * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
           */
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            // 렌더링하고 싶은 결제 UI의 variantKey
            // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
            // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
            variantKey: "DEFAULT",
          }),
          /**
           * 약관을 렌더링합니다.
           * @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
           */
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        setReady(true);
      } catch (error) {
        console.error("위젯 렌더링 실패:", error);
      }
    }

    renderPaymentWidgets();
  }, [widgets, amount]); // amount 추가로 금액 변경 시에도 재렌더링

  return (
    <div className="flex items-center justify-center bg-[#161616] px-4 py-10">
      <div className="flex w-[700px] h-[650px] overflow-hidden rounded-3xl bg-white">
        <section className="flex flex-1 flex-col h-full bg-white p-8">
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2">
              <div>
                <div id="payment-method" className="payment-widget" />
              </div>
              <div className="mt-6">
                <div id="agreement" className="agreement-widget" />
              </div>
            </div>
            <button
              className="mt-8 w-full cursor-pointer rounded-lg bg-[#0064FF] py-3.5 text-[16px] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!ready}
              onClick={async () => {
                try {
                  /**
                   * 결제 요청
                   * 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                   * 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                   * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
                   */
                  const plan =
                    productInfo?.plan || fallbackProduct.plan || "yearly";
                  const referralCode =
                    productInfo?.referral?.code ||
                    productInfo?.referral?.referralCode ||
                    null;
                  const successUrl = new URL(
                    "/api/payments/success",
                    window.location.origin
                  );
                  successUrl.searchParams.set("plan", plan);
                  if (referralCode) {
                    successUrl.searchParams.set("referralCode", referralCode);
                  }
                  await widgets?.requestPayment({
                    orderId: generateRandomString(),
                    orderName: productInfo?.name || fallbackProduct.name,
                    customerName: productInfo?.buyer?.name || "구매자",
                    customerEmail:
                      productInfo?.buyer?.email || "customer@example.com",
                    customerMobilePhone: productInfo?.buyer?.phone,
                    successUrl: successUrl.toString(),
                    failUrl: `${
                      window.location.origin
                    }/api/payments/fail?plan=${encodeURIComponent(plan)}`,
                  });
                } catch (error) {
                  console.error("결제 요청 실패:", error);
                }
              }}
            >
              {ready ? "결제하기" : "결제 준비 중..."}
            </button>
          </div>
        </section>

        <aside className="flex flex-col w-[210px] justify-between bg-[#F2F4F6] p-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#8B95A1]">상품명</span>
              <p className="text-[14px] font-normal leading-relaxed text-[#4E5968]">
                {productInfo?.name == "블로그 서이추 자동화 - 1년 이용권"
                  ? "블로그 서이추 자동화(1년)"
                  : productInfo.name}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-[#8B95A1]">
                결제 금액
              </span>
              {referralInfo?.discountAmount ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[26px] font-bold text-[#191F28]">
                    {formatCurrency(
                      productInfo?.price || fallbackProduct.price
                    )}
                  </span>
                  <span className="text-xs font-semibold text-[#0064FF]">
                    추천인 할인 -{formatCurrency(referralInfo.discountAmount)}{" "}
                    (5%)
                  </span>
                </div>
              ) : (
                <span className="text-[26px] font-bold text-[#191F28]">
                  {formatCurrency(productInfo?.price || fallbackProduct.price)}
                </span>
              )}
            </div>

            {!referralInfo?.discountAmount &&
              (referralInfo?.code || referralInfo?.referralCode) && (
                <span className="text-xs text-[#4B5563]">
                  추천인 코드: {referralInfo.code || referralInfo.referralCode}
                </span>
              )}
          </div>

          <div>
            <Image
              src="/image/logoText.png"
              alt="Autobomber"
              width={160}
              height={40}
              priority
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="wrapper w-100 flex items-center justify-center">
          <p className="text-gray-600">결제 정보를 불러오는 중입니다...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
