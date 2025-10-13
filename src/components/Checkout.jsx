import { Suspense, useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useSearchParams } from "next/navigation";

const generateRandomString = () => window.btoa(Math.random()).slice(0, 20);
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const fallbackProduct = {
  name: "블로그 서이추 자동화 프로그램",
  price: 239000,
  description: "블로그 서이추 자동화",
  plan: "yearly",
};

function CheckoutContent() {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [productInfo, setProductInfo] = useState(fallbackProduct);
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: fallbackProduct.price,
  });
  const searchParams = useSearchParams();

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
    <div className="wrapper w-100">
      <div className="max-w-540 w-100 bg-white">
        {/* 상품 정보 표시 */}

        <div id="payment-method" className="w-100" />
        <div id="agreement" className="w-100" />
        <div className="btn-wrapper w-100">
          <button
            className="btn primary w-100"
            disabled={!ready}
            onClick={async () => {
              try {
                /**
                 * 결제 요청
                 * 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                 * 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                 * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
                 */
                const plan = productInfo?.plan || fallbackProduct.plan || "yearly";
                await widgets?.requestPayment({
                  orderId: generateRandomString(),
                  orderName: productInfo?.name || fallbackProduct.name,
                  customerName: productInfo?.buyer?.name || "구매자",
                  customerEmail:
                    productInfo?.buyer?.email || "customer@example.com",
                  customerMobilePhone: productInfo?.buyer?.phone,
                  successUrl: `${window.location.origin}/api/payments/success?plan=${encodeURIComponent(plan)}`,
                  failUrl: `${window.location.origin}/api/payments/fail?plan=${encodeURIComponent(plan)}`,
                });
              } catch (error) {
                console.error("결제 요청 실패:", error);
              }
            }}
          >
            {ready ? "결제하기" : "결제 준비 중..."}
          </button>
        </div>
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
