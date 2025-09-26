"use client";

// import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
// const customerKey = "_RUcEb7t-ZHGOPTXlmKNs";
import { CheckoutPage } from "@/components/Checkout";
// const generateRandomString = () => Math.random().toString(36).substring(2, 15);
export default function BuyPage() {
  return <CheckoutPage />;
}

// export default function BuyPage() {
//   const [amount, setAmount] = useState({
//     currency: "KRW",
//     value: 50000,
//   });
//   const [ready, setReady] = useState(false);
//   const [widgets, setWidgets] = useState(null);
//   const [productInfo, setProductInfo] = useState(null);
//   const searchParams = useSearchParams();

//   // URL 파라미터에서 제품 정보 가져오기
//   useEffect(() => {
//     const productParam = searchParams.get("product");
//     if (productParam) {
//       try {
//         const product = JSON.parse(productParam);
//         setProductInfo(product);
//         setAmount({
//           currency: "KRW",
//           value: product.price,
//         });
//       } catch (error) {
//         console.error("제품 정보 파싱 실패:", error);
//         // 기본 제품 정보 설정
//         setProductInfo({
//           name: "오토봄버 제품",
//           price: 50000,
//           description: "고품질 프리미엄 제품",
//         });
//       }
//     } else {
//       // 기본 제품 정보 설정
//       setProductInfo({
//         name: "오토봄버 제품",
//         price: 50000,
//         description: "고품질 프리미엄 제품",
//       });
//     }
//   }, [searchParams]);

//   useEffect(() => {
//     async function fetchPaymentWidgets() {
//       try {
//         console.log("🔄 토스페이먼츠 SDK 로딩 시작...");
//         console.log("🔑 클라이언트 키:", clientKey);

//         // ------  결제위젯 초기화 ------
//         const tossPayments = await loadTossPayments(clientKey);
//         console.log("✅ 토스페이먼츠 SDK 로드 완료:", tossPayments);

//         // 비회원 결제
//         console.log("🔄 위젯 초기화 중... customerKey:", ANONYMOUS);
//         const widgets = tossPayments.widgets({ customerKey });
//         console.log("✅ 위젯 초기화 완료:", widgets);

//         setWidgets(widgets);
//       } catch (error) {
//         console.error("❌ SDK 로드 실패:", error);
//         console.error("에러 상세:", error.message, error.stack);
//       }
//     }

//     fetchPaymentWidgets();
//   }, [clientKey]);

//   useEffect(() => {
//     async function renderPaymentWidgets() {
//       if (widgets == null) {
//         console.log("⏸️ 위젯이 아직 초기화되지 않음");
//         return;
//       }

//       try {
//         console.log("🔄 위젯 렌더링 시작...");
//         console.log("💰 결제 금액 설정:", amount);

//         // ------ 주문의 결제 금액 설정 ------
//         await widgets.setAmount(amount);
//         console.log("✅ 결제 금액 설정 완료");

//         console.log("🔄 DOM 요소 확인...");
//         const paymentElement = document.getElementById("payment-method");
//         const agreementElement = document.getElementById("agreement");
//         console.log("payment-method 요소:", paymentElement);
//         console.log("agreement 요소:", agreementElement);

//         console.log("🔄 위젯 렌더링 중...");
//         await Promise.all([
//           // ------  결제 UI 렌더링 ------
//           widgets
//             .renderPaymentMethods({
//               selector: "#payment-method",
//               variantKey: "DEFAULT",
//             })
//             .then(() => console.log("✅ 결제 UI 렌더링 완료")),
//           // ------  이용약관 UI 렌더링 ------
//           widgets
//             .renderAgreement({
//               selector: "#agreement",
//               variantKey: "AGREEMENT",
//             })
//             .then(() => console.log("✅ 약관 UI 렌더링 완료")),
//         ]);

//         console.log("🎉 모든 위젯 렌더링 완료!");
//         setReady(true);
//       } catch (error) {
//         console.error("❌ 위젯 렌더링 실패:", error);
//         console.error("에러 상세:", error.message, error.stack);
//       }
//     }

//     renderPaymentWidgets();
//   }, [widgets]);

//   useEffect(() => {
//     if (widgets == null) {
//       return;
//     }

//     widgets.setAmount(amount);
//   }, [widgets, amount]);

//   return (
//     <div className="wrapper">
//       <div className="box_section">
//         {/* 결제 UI */}
//         <div id="payment-method" />

//         {/* 이용약관 UI */}
//         <div id="agreement" />

//         {/* 결제하기 버튼 */}
//         <button
//           className="button"
//           disabled={!ready}
//           onClick={async () => {
//             try {
//               // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
//               // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
//               // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
//               await widgets.requestPayment({
//                 orderId: generateRandomString(),
//                 orderName: productInfo?.name || "오토봄버 제품",
//                 successUrl: `${window.location.origin}/api/payments/success`,
//                 failUrl: `${window.location.origin}/api/payments/fail`,
//                 customerEmail: "customer@example.com",
//                 customerName: "김고객",
//                 customerMobilePhone: "01012345678",
//               });
//             } catch (error) {
//               // 에러 처리하기
//               console.error(error);
//             }
//           }}
//         >
//           결제하기
//         </button>
//       </div>
//     </div>
//   );
// }
