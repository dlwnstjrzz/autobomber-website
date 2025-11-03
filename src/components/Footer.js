import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 회사 정보 */}
          <div className="text-left space-y-4 mb-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold">상호:</span> 주식회사 만월 |{" "}
                <span className="font-semibold">대표:</span> 손재경
              </p>
              <p>
                <span className="font-semibold">사업자 등록번호:</span>{" "}
                325-86-03628
              </p>
              <p>
                <span className="font-semibold">주소:</span> 경기도 파주시
                경의로 1092, 808-A157호
              </p>
              <p>
                <span className="font-semibold">전화번호:</span> 070-7954-7879 |{" "}
                <span className="font-semibold">이메일:</span>{" "}
                official@autobomber.com
              </p>
              <p>
                <span className="font-semibold">통신판매신고번호:</span>{" "}
                제2025-경기파주-1640호
              </p>
            </div>
          </div>

          {/* 약관 링크 */}
          <div className="flex justify-start space-x-6 mb-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              개인정보처리방침
            </Link>
          </div>

          {/* 저작권 */}
          <div className="text-left pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2025 주식회사 만월. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
