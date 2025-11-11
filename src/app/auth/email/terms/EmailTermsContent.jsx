'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailTermsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    age: false,
    sms: false,
    email: false,
  });
  const [error, setError] = useState("");

  const allChecked = useMemo(
    () => Object.values(agreements).every(Boolean),
    [agreements]
  );

  const toggleAgreement = (key) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleAll = () => {
    const nextValue = !allChecked;
    setAgreements({
      terms: nextValue,
      privacy: nextValue,
      age: nextValue,
      sms: nextValue,
      email: nextValue,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!agreements.terms || !agreements.privacy || !agreements.age) {
      setError("필수 약관에 모두 동의해주세요.");
      return;
    }

    setError("");
    const query = new URLSearchParams();
    query.set("sms", agreements.sms ? "true" : "false");
    query.set("email", agreements.email ? "true" : "false");
    if (redirectParam) {
      query.set("redirect", redirectParam);
    }

    router.push(`/auth/email/register?${query.toString()}`);
  };

  const AgreementItem = ({ label, description, required, name, extra }) => (
    <label className="flex items-start space-x-3 rounded-xl border border-border p-4 cursor-pointer hover:border-[#0164FF]">
      <input
        type="checkbox"
        checked={agreements[name]}
        onChange={() => toggleAgreement(name)}
        className="mt-1 h-4 w-4 rounded border-input text-[#0164FF] focus:ring-[#0164FF]"
      />
      <div>
        <p className="text-card-foreground font-medium">
          {label}
          <span className="ml-2 text-xs font-semibold text-[#0164FF]">
            {required ? "(필수)" : "(선택)"}
          </span>
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {extra}
      </div>
    </label>
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg p-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">이메일 회원가입</p>
          <h1 className="text-3xl font-bold text-card-foreground">약관 동의</h1>
          <p className="text-sm text-muted-foreground">
            서비스 이용을 위해 필요한 약관에 동의해주세요.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex items-center space-x-3 rounded-xl border border-border p-4 cursor-pointer hover:border-[#0164FF] bg-muted/40">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleToggleAll}
              className="h-4 w-4 rounded border-input text-[#0164FF] focus:ring-[#0164FF]"
            />
            <span className="font-semibold text-card-foreground">전체 동의하기</span>
          </label>

          <AgreementItem
            label="이용 약관 동의"
            description="서비스 제공을 위해 반드시 필요한 약관입니다."
            required
            name="terms"
            extra={
              <Link
                href="/terms"
                className="inline-flex items-center text-xs text-[#0164FF] font-medium mt-2"
              >
                이용약관 자세히 보기 →
              </Link>
            }
          />

          <AgreementItem
            label="개인정보 수집 및 이용 동의"
            required
            name="privacy"
            extra={
              <p className="mt-2 text-sm leading-6 text-muted-foreground whitespace-pre-line">
                {`1. 개인정보 수집목적 및 이용목적

(1) 홈페이지 회원 가입 및 관리
회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별․인증, 회원자격 유지․관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정 이용 방지, 만 14세 미만 아동의 개인정보 처리시 법정대리인의 동의 여부 확인, 각종 고지․통지, 고충 처리 등의 목적

(2) 재화 또는 서비스 제공
물품 배송, 서비스 제공, 계약서․청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증, 연령인증, 요금 결제 및 정산, 채권추심 등의 목적

(3) 고충 처리
민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락․통지, 처리 결과 통보 등

2. 수집하는 개인정보 항목
ID, 성명, 비밀번호, 주소, 휴대폰 번호, 이메일, 14세 미만 가입자의 경우 법정대리인 정보

3. 개인정보 보유 및 이용기간
회원탈퇴 시까지 (단, 관계 법령에 보존 근거가 있는 경우 해당 기간 시까지 보유, 개인정보처리방침에서 확인 가능)`}
              </p>
            }
          />

          <AgreementItem
            label="만 14세 이상입니다."
            description="만 14세 미만은 서비스 이용이 제한됩니다."
            required
            name="age"
          />

          <AgreementItem
            label="메시지(SMS, 카카오톡 등) 수신 동의"
            description="신규 기능 및 혜택 정보를 안내드립니다."
            required={false}
            name="sms"
          />

          <AgreementItem
            label="E-Mail 수신 동의"
            description="프로모션, 이벤트 소식을 이메일로 받아볼 수 있습니다."
            required={false}
            name="email"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#0164FF] text-white py-3 rounded-xl font-semibold hover:bg-[#0155d9] transition-colors"
          >
            가입하기
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          동의한 마케팅 알림은 마이페이지에서 언제든지 변경할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
