"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProductSection() {
  const [selectedPlan, setSelectedPlan] = useState("trial"); // 'trial' or 'yearly'
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const planSectionRef = useRef(null);

  const scrollToPlans = () => {
    if (planSectionRef.current) {
      planSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleTrialStart = async () => {
    if (isStartingTrial) {
      return;
    }

    if (!user) {
      const redirectPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    try {
      setIsStartingTrial(true);
      // 체험 코드 생성 API 호출
      const response = await fetch("/api/trial/create", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        // 성공시 trial 데이터와 함께 purchase 페이지로 이동
        router.push(`/purchase?plan=trial&code=${data.trial.code}`);
      } else {
        // 실패시 에러와 함께 purchase 페이지로 이동 (이미 사용한 계정 등)
        router.push(
          `/purchase?plan=trial&error=${encodeURIComponent(data.error)}`
        );
      }
    } catch (error) {
      console.error("체험 시작 오류:", error);
      alert("체험 시작 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handlePurchaseClick = (e) => {
    e.preventDefault();

    if (selectedPlan === "trial" && isStartingTrial) {
      return;
    }

    if (selectedPlan === "trial") {
      handleTrialStart();
      return;
    }

    if (!user) {
      const redirectPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    router.push(`/purchase?plan=yearly`);
  };
  return (
    <section
      className="pt-0 pb-16 sm:py-16 bg-card bg-[#1a1a1a]"
      ref={planSectionRef}
    >
      <div className="mx-auto w-full max-w-7xl px-1 sm:px-4">
        {isStartingTrial && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
            <img
              src="/image/loadingSpinner.gif"
              alt="Loading..."
              className="w-32 h-32 mb-4"
            />
            <p className="text-white text-lg font-semibold">
              1일 무료 체험을 준비하고 있어요...
            </p>
          </div>
        )}
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 p-6 sm:p-12">
            {/* 상품 영상 */}
            <div className="lg:w-[55%]">
              <div className="rounded-lg overflow-hidden bg-secondary">
                <video
                  src="/video/blogAutoThumb.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer"
                >
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="lg:w-[45%] flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-3">
                    블로그 서이추 자동화 프로그램
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    서이추 자동화 프로그램 끝판왕
                    <br />
                    *2025.11.11 업데이트 완료
                  </p>
                </div>

                {/* 플랜 선택 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-card-foreground">
                    플랜 선택
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`border-2 rounded-lg p-4 relative cursor-pointer transition-colors ${
                        selectedPlan === "trial"
                          ? "border-green-500 bg-green-900/20"
                          : "border-border bg-card hover:border-green-300"
                      }`}
                      onClick={() => setSelectedPlan("trial")}
                    >
                      <div className="absolute -top-2 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        🎉 무료체험
                      </div>
                      <div className="mt-2 text-center">
                        <div
                          className={`text-lg font-bold ${
                            selectedPlan === "trial"
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          1일 체험
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            selectedPlan === "trial"
                              ? "text-green-700"
                              : "text-muted-foreground"
                          }`}
                        >
                          무료
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer text-center relative transition-colors ${
                        selectedPlan === "yearly"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary"
                      }`}
                      onClick={() => setSelectedPlan("yearly")}
                    >
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        57% 할인
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          selectedPlan === "yearly"
                            ? "text-card-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        1년 이용권
                      </div>
                      <div className="mt-2">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 sm:space-x-2">
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ₩239,000
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground line-through">
                            ₩550,000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주요 기능 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-card-foreground">
                    주요 기능
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>서로이웃 자동 추가</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>공감 + 댓글 자동 작성</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>서이추 신청 자동 취소</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 구매 버튼 */}
              <div className="pt-6">
                <button
                  onClick={handlePurchaseClick}
                  disabled={selectedPlan === "trial" ? isStartingTrial : false}
                  className={`cursor-pointer w-full py-4 px-6 rounded-lg font-semibold text-center transition-colors shadow-lg text-lg ${
                    selectedPlan === "trial"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  } ${
                    selectedPlan === "trial" && isStartingTrial
                      ? "opacity-80 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {selectedPlan === "trial"
                    ? isStartingTrial
                      ? "체험 준비 중..."
                      : "1일 무료 이용 코드 받기"
                    : "1년 이용권 구매하기"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 페이지 이미지들 */}
        <div className="mt-16 space-y-4 bg-[#1a1a1a] -mx-1 sm:mx-auto sm:max-w-4xl sm:px-4">
          {Array.from({ length: 17 }, (_, index) => (
            <div key={index + 1} className="w-full">
              <img
                src={`/image/blog_automation/자동화 폭격기 찐 최종_${
                  index + 1
                }.png`}
                alt={`상품 상세 이미지 ${index + 1}`}
                className="block h-auto max-w-full sm:rounded-lg sm:shadow-sm mx-auto"
                loading="lazy"
              />
              {index + 1 === 1 ? (
                <video
                  src="/video/상세페이지1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer"
                  onClick={scrollToPlans}
                ></video>
              ) : (
                ""
              )}
              {index + 1 === 11 ? (
                <video
                  src="/video/상세페이지3.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer"
                  onClick={scrollToPlans}
                ></video>
              ) : (
                ""
              )}
              {index + 1 === 2 ? (
                <video
                  src="/video/상세페이지서이추영상.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer mt-[-2px]"
                ></video>
              ) : (
                ""
              )}
              {index + 1 === 8 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((seq) => (
                    <img
                      key={seq}
                      src={`/image/blog_automation/상세페이지4-${seq}.png`}
                      alt={`상품 상세 이미지 ${index + 1}`}
                      className="block h-auto max-w-full mx-auto"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : (
                ""
              )}
              {index + 1 === 4 ? (
                <video
                  src="/video/상세페이지서이추만.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer mt-[-2px]"
                ></video>
              ) : (
                ""
              )}
              {index + 1 === 6 ? (
                <div className="items-center">
                  <video
                    src="/video/이웃커넥트서이추.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto cursor-pointer mt-[-2px]"
                  ></video>
                  <p className="text-base text-gray-500 font-semibold mt-3 mb-8 text-center">
                    원하는 블로거의 이웃들을 자동 추가
                  </p>

                  <video
                    src="/video/키워드검색서이추.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto cursor-pointer"
                  ></video>
                  <p className="text-base text-gray-500 font-semibold mt-3 mb-3 text-center">
                    원하는 키워드와 연관된 이웃 추가
                  </p>
                </div>
              ) : (
                ""
              )}
              {index + 1 === 17 ? (
                <video
                  src="/video/상세페이지4.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer"
                  onClick={scrollToPlans}
                ></video>
              ) : (
                ""
              )}
              {index + 1 === 12 ? (
                <video
                  src="/video/상세페이지2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto cursor-pointer"
                  onClick={scrollToPlans}
                ></video>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
