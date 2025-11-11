'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPageContent() {
  const {
    user,
    signInWithGoogle,
    signInWithKakao,
    signInWithEmail,
    logout,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTarget =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

  useEffect(() => {
    if (user && redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [user, redirectTarget, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push(redirectTarget || "/");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoSignIn = () => {
    setIsLoading(true);
    signInWithKakao(redirectTarget || "/");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email || !password) {
      setEmailError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setEmailLoginLoading(true);
      await signInWithEmail(email, password);
      router.push(redirectTarget || "/");
    } catch (error) {
      console.error("이메일 로그인 실패:", error);
      const message =
        error?.code === "auth/invalid-credential"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "이메일 로그인에 실패했습니다. 다시 시도해주세요.";
      setEmailError(message);
    } finally {
      setEmailLoginLoading(false);
    }
  };

  const goToEmailSignup = () => {
    const redirectSuffix = redirectTarget
      ? `?redirect=${encodeURIComponent(redirectTarget)}`
      : "";
    router.push(`/auth/email/terms${redirectSuffix}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-card rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-card-foreground">
          {user ? "계정 관리" : "로그인"}
        </h1>

        {user ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                {(user.photoURL || user.profile_image) ? (
                  <img
                    src={user.photoURL || user.profile_image}
                    alt="프로필 이미지"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {(user.displayName || user.nickname)?.[0] || "U"}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                {user.displayName || user.nickname || "사용자"}
              </h2>
              <p className="text-muted-foreground">카카오 계정</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                자동화 폭격기 서비스를 이용하려면 로그인이 필요합니다.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white text-gray-700 border border-gray-300 py-4 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Google로 로그인/회원가입</span>
                  </>
                )}
              </button>

              <button
                onClick={handleKakaoSignIn}
                disabled={isLoading}
                className="w-full bg-[#FEE500] text-black py-4 px-6 rounded-xl font-semibold hover:bg-[#FFEB3B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-sm"
                style={{ backgroundColor: "#FEE500" }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Image
                      src="/image/kakao_symbol.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                      카카오 로그인/회원가입
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  이메일로 로그인
                </span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showEmailPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40 pr-12"
                    placeholder="비밀번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-card-foreground"
                    aria-label={showEmailPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showEmailPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                  </button>
                </div>
              </div>

              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}

              <button
                type="submit"
                disabled={emailLoginLoading}
                className="w-full bg-[#0164FF] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0155d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoginLoading ? "로그인 중..." : "이메일로 로그인"}
              </button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={goToEmailSignup}
                className="text-xs underline text-muted-foreground hover:text-card-foreground"
              >
                이메일로 회원가입
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
