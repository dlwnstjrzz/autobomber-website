"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProductSection() {
  const [selectedPlan, setSelectedPlan] = useState("trial"); // 'trial' or 'yearly'
  const { user } = useAuth();
  const router = useRouter();

  const handlePurchaseClick = (e) => {
    e.preventDefault();

    if (!user) {
      // 미로그인 시 로그인 페이지로 이동
      router.push("/auth");
      return;
    }

    // 로그인된 상태면 구매 페이지로 이동
    const planParam = selectedPlan === "trial" ? "trial" : "yearly";
    router.push(`/purchase?plan=${planParam}`);
  };
  return (
    <section className="py-16" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 p-12">
            {/* 상품 영상 */}
            <div className="lg:w-[55%]">
              <div className="rounded-lg overflow-hidden bg-secondary">
                <video
                  src="/video/blogAutoThumb.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="lg:w-[45%] flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-card-foreground mb-3">
                    블로그 서이추 자동화 프로그램
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    네이버 블로거 1,000명이 선택한 서이추 자동화 프로그램 끝판왕
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
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl font-bold text-primary">
                            ₩239,000
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
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
                  className={`cursor-pointer w-full py-4 px-6 rounded-lg font-semibold text-center transition-colors shadow-lg text-lg ${
                    selectedPlan === "trial"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {selectedPlan === "trial"
                    ? "1일 무료로 체험하기"
                    : "1년 이용권 구매하기"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 페이지 이미지들 */}
        <div className="max-w-4xl mx-auto mt-16 space-y-4">
          {Array.from({ length: 20 }, (_, index) => (
            <div key={index + 1} className="w-full">
              <img
                src={`/image/blog_automation/블로그 서이추 자동화 상세페이지 초안_${
                  index + 1
                }.jpeg`}
                alt={`상품 상세 이미지 ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-sm"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
