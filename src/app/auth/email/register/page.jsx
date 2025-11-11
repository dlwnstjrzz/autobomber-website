'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";

export default function EmailRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerWithEmail } = useAuth();

  const redirectParam = searchParams.get("redirect");
  const smsConsent = searchParams.get("sms") === "true";
  const emailConsent = searchParams.get("email") === "true";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    contact: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState({
    checked: false,
    available: false,
  });
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      setEmailCheckStatus({ checked: false, available: false });
      setEmailCheckMessage("");
    }
  };

  const handleEmailCheck = async () => {
    if (!formData.email) {
      setEmailCheckMessage("이메일을 입력한 뒤 중복 확인을 눌러주세요.");
      return;
    }

    const emailPattern = /.+@.+\..+/;
    if (!emailPattern.test(formData.email)) {
      setEmailCheckMessage("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      setEmailCheckLoading(true);
      setEmailCheckMessage("");
      const methods = await fetchSignInMethodsForEmail(auth, formData.email);
      const available = methods.length === 0;
      setEmailCheckStatus({ checked: true, available });
      setEmailCheckMessage(
        available ? "사용 가능한 이메일입니다." : "이미 가입된 이메일입니다."
      );
    } catch (checkError) {
      console.error("이메일 중복 확인 오류:", checkError);
      setEmailCheckMessage("중복 확인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setEmailCheckStatus({ checked: false, available: false });
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password, name, contact } = formData;

    if (!email || !password || !name || !contact) {
      setError("모든 정보를 빠짐없이 입력해주세요.");
      return;
    }

    if (!emailCheckStatus.checked || !emailCheckStatus.available) {
      setError("이메일 중복 확인을 완료해주세요.");
      return;
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordPattern.test(password)) {
      setError("비밀번호는 숫자와 영문을 포함해 6자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await registerWithEmail({
        email,
        password,
        name,
        contact,
        marketingSms: smsConsent,
        marketingEmail: emailConsent,
      });

      alert("가입이 완료되었습니다.");
      router.push("/");
    } catch (registrationError) {
      console.error("이메일 회원가입 실패:", registrationError);
      let message = "회원가입 중 문제가 발생했습니다. 다시 시도해주세요.";
      if (registrationError?.code === "auth/email-already-in-use") {
        message = "이미 사용 중인 이메일입니다.";
      } else if (registrationError?.code === "auth/weak-password") {
        message = "비밀번호는 6자 이상이어야 합니다.";
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg p-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">이메일 회원가입</p>
          <h1 className="text-3xl font-bold text-card-foreground">가입 정보 입력</h1>
          <p className="text-sm text-muted-foreground">
            이메일, 비밀번호, 이름, 연락처 정보를 입력해주세요.
          </p>
        </div>

        <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground space-y-1">
          <p>
            메시지 수신 동의: <strong>{smsConsent ? "동의" : "미동의"}</strong>
          </p>
          <p>
            이메일 수신 동의: <strong>{emailConsent ? "동의" : "미동의"}</strong>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40"
                placeholder="example@email.com"
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={emailCheckLoading}
                className="whitespace-nowrap px-4 py-3 rounded-lg border border-[#0164FF] text-[#0164FF] font-semibold hover:bg-[#0164FF]/10 disabled:opacity-50"
              >
                {emailCheckLoading ? "확인 중" : "중복 확인"}
              </button>
            </div>
            {emailCheckMessage && (
              <p
                className={`mt-2 text-sm ${
                  emailCheckStatus.available ? "text-[#0164FF]" : "text-red-600"
                }`}
              >
                {emailCheckMessage}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40 pr-12"
                placeholder="숫자와 영문 포함 6자 이상"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-card-foreground"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40 pr-12"
                placeholder="비밀번호를 한 번 더 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-card-foreground"
                aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
              >
                {showConfirmPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              이름 <span className="text-[#0164FF]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              연락처 <span className="text-[#0164FF]">*</span>
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-[#0164FF]/40"
              placeholder="010-0000-0000"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0164FF] text-white py-3 rounded-xl font-semibold hover:bg-[#0155d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "가입하는 중..." : "가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
