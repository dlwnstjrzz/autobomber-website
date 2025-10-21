"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const currentLocation = queryString ? `${pathname}?${queryString}` : pathname;
  const loginHref =
    currentLocation && currentLocation !== "/auth"
      ? `/auth?redirect=${encodeURIComponent(currentLocation)}`
      : "/auth";

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header
      className="bg-background border-b border-border"
      onClick={() => (isUserMenuOpen ? setIsUserMenuOpen(false) : "")}
    >
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <Image
              src="/image/logo.png"
              alt="자동화 폭격기 로고"
              width={60}
              height={60}
              className="w-18 h-auto"
            />
            <Image
              src="/image/logoText.svg"
              alt="자동화 폭격기"
              width={160}
              height={40}
              className="h-48 w-auto"
            />
          </Link>

          {/* 우측 메뉴 */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/notices"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              공지사항
            </Link>
            <Link
              href="https://blog.naver.com/autobomber/223996758113"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              사용 가이드
            </Link>
            <Link
              href="/orders"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              주문조회
            </Link>

            {user ? (
              // 로그인된 상태 - 사용자 프로필 메뉴
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-primary">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="프로필 이미지"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {user.displayName?.[0] || "U"}
                      </div>
                    )}
                  </div>
                </button>

                {/* 드롭다운 메뉴 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-semibold text-card-foreground">
                          {user.displayName || "사용자"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/mypage"
                        className="block px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        마이페이지
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        주문조회
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-secondary transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 로그인되지 않은 상태
              <Link
                href={loginHref}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden text-foreground hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link
                href="/notices"
                className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                공지사항
              </Link>
              <Link
                href="https://blog.naver.com/autobomber/223996758113"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                사용 가이드
              </Link>
              <Link
                href="/orders"
                className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                주문조회
              </Link>

              {user ? (
                // 모바일 - 로그인된 상태
                <>
                  <div className="px-4 py-2 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-primary">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="프로필 이미지"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                            {user.displayName?.[0] || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {user.displayName || "사용자"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/mypage"
                    className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <Link
                    href="/orders"
                    className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    주문조회
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-foreground hover:text-primary transition-colors font-medium px-4 py-2"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                // 모바일 - 로그인되지 않은 상태
                <Link
                  href={loginHref}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors mx-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
