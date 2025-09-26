"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function MarginCalculator() {
  const { user } = useAuth();
  const router = useRouter();

  const handlePurchaseClick = () => {
    const productInfo = {
      name: "마진 계산기",
      price: 19900,
      description: "정확한 수익률 계산을 위한 필수 도구",
      features: [
        "스마트스토어/쿠팡 각종 수수료 자동 적용",
        "원가, 배송비, 카드 수수료 등 모든 비용 입력 가능",
        "판매가 변경 시 마진 변화 실시간 확인",
        "CSV, 엑셀 파일로 결과 저장 가능 (옵션)",
        "사용법이 간단하여 초보자도 바로 활용 가능"
      ]
    };

    const queryParams = new URLSearchParams({
      product: JSON.stringify(productInfo)
    });

    router.push(`/buy?${queryParams.toString()}`);
  };

  return (
    <section className="py-16" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col gap-8 p-12">
            {/* 상품 정보 */}
            <div className="flex flex-col">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-card-foreground mb-3">
                    마진 계산기
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    정확한 수익률 계산을 위한 필수 도구
                  </p>
                </div>

                {/* 가격 정보 */}
                <div className="space-y-4">
                  <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
                    <div className="text-center">
                      <div className="text-lg font-bold text-card-foreground mb-2">
                        구매
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        ₩19,900
                      </div>
                      <div className="text-sm text-muted-foreground mt-2"></div>
                    </div>
                  </div>
                </div>

                {/* 주요 기능 */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                    ⚡ 주요 기능
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>스마트스토어/쿠팡 각종 수수료 자동 적용</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>
                        원가, 배송비, 카드 수수료 등 모든 비용 입력 가능
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>판매가 변경 시 마진 변화 실시간 확인</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>CSV, 엑셀 파일로 결과 저장 가능 (옵션)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>사용법이 간단하여 초보자도 바로 활용 가능</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 구매 버튼 */}
              <div className="pt-6">
                <button
                  onClick={handlePurchaseClick}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-center transition-colors shadow-lg text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  구매하기
                </button>
              </div>
            </div>

            {/* 상품 이미지 */}
            <div className="w-full">
              <div className="rounded-lg overflow-hidden bg-secondary">
                <img
                  src="/image/margin.png"
                  alt="마진 계산기 프로그램"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 상세 페이지 내용들 */}
        <div className="max-w-4xl mx-auto mt-16 space-y-12">
          {/* 사용 방법 */}
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-2">
              🛠 사용 방법
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span className="text-muted-foreground">
                  판매 채널 선택 (스마트스토어 / 쿠팡)
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span className="text-muted-foreground">
                  판매가, 원가, 배송비 등 입력
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span className="text-muted-foreground">
                  버튼 클릭 → 마진, 수익, 손익 구조 즉시 확인
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <span className="text-muted-foreground">
                  필요 시 가격 조정 후 재계산
                </span>
              </div>
            </div>
          </div>

          {/* 추천 대상 */}
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-2">
              🎯 이런 분들에게 추천합니다
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>막 스마트스토어나 쿠팡 판매를 시작한 초보 판매자</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>상품 등록 후 정확한 수익 구조가 궁금한 판매자</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>
                  여러 상품을 동시에 분석해 효율적인 가격 전략을 세우고 싶은
                  판매자
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>
                  이벤트/할인 적용 시 손익을 미리 확인하고 싶은 판매자
                </span>
              </li>
            </ul>
          </div>

          {/* 장점 */}
          <div className="bg-card rounded-lg p-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-6 flex items-center gap-2">
              ✅ 한눈에 보는 장점
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">
                  시간 절약
                </h4>
                <p className="text-muted-foreground">수작업 계산 필요 없음</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">정확성</h4>
                <p className="text-muted-foreground">
                  수수료, 배송비까지 반영된 실제 마진 확인
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">편리성</h4>
                <p className="text-muted-foreground">
                  단순한 입력으로 판매 전략 수립 가능
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-card-foreground">확장성</h4>
                <p className="text-muted-foreground">
                  다양한 상품·판매 채널 분석 가능
                </p>
              </div>
            </div>
          </div>

          {/* 결론 */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-card-foreground mb-4 flex items-center justify-center gap-2">
              📌 결론
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                판매는 열심히 하는데 손에 남는 돈이 적다고 느낀다면,
                <br />
                이제 스마트스토어·쿠팡 마진 계산기로 한눈에, 정확하게, 빠르게 내
                수익 구조를 파악하세요.
              </p>
              <p className="font-semibold text-card-foreground">
                이제는 가격 전략, 상품 전략, 이벤트 전략까지 손쉽게 관리하며,
                <br />
                매출과 수익을 동시에 잡을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
