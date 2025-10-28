import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

function parseJsonCookie(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("쿠키 파싱 실패:", error);
    return null;
  }
}

function generateLicenseCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function ensureLicenseForUser({
  request,
  orderId,
  amount,
  plan,
  paymentKey,
}) {
  if (!orderId || plan !== "yearly") {
    return;
  }

  const kakaoSession = parseJsonCookie(
    request.cookies.get("kakao_session")?.value
  );
  const firebaseUser = parseJsonCookie(
    request.cookies.get("firebase_user")?.value
  );

  let userId = null;
  let loginType = null;
  let userProfile = null;

  if (kakaoSession) {
    userId = `kakao_${kakaoSession.id}`;
    loginType = "kakao";
    userProfile = {
      name:
        kakaoSession.nickname ??
        kakaoSession.profile_nickname ??
        kakaoSession.name ??
        null,
      email: kakaoSession.email ?? null,
    };
  } else if (firebaseUser) {
    userId = `google_${firebaseUser.uid}`;
    loginType = "google";
    userProfile = {
      name: firebaseUser.displayName ?? firebaseUser.email ?? null,
      email: firebaseUser.email ?? null,
    };
  }

  if (!userId) {
    console.warn("라이센스 생성 불가 - 사용자 정보를 찾을 수 없음", {
      orderId,
    });
    return;
  }

  try {
    const existingQuery = query(
      collection(db, "licenses"),
      where("orderId", "==", orderId),
      where("userId", "==", userId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      console.log("라이센스가 이미 존재합니다.", { orderId, userId });
      return;
    }

    const licenseCode = generateLicenseCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const licenseData = {
      code: licenseCode,
      orderId,
      userId,
      loginType,
      plan,
      amount: amount ? Number(amount) : null,
      status: "active",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      paymentKey: paymentKey ?? null,
      buyerName: userProfile?.name ?? null,
      buyerEmail: userProfile?.email ?? null,
    };

    Object.keys(licenseData).forEach((key) => {
      if (licenseData[key] === null || licenseData[key] === undefined) {
        delete licenseData[key];
      }
    });

    await setDoc(doc(db, "licenses", licenseCode), licenseData);
    console.log("라이센스 생성 완료", { orderId, userId, licenseCode });
  } catch (error) {
    console.error("라이센스 생성 실패:", error);
  }
}

async function rewardReferralIfNeeded({
  request,
  orderId,
  amount,
  plan,
  referralCode,
}) {
  if (!referralCode || !orderId || !amount || plan !== "yearly") {
    return;
  }

  const kakaoSession = parseJsonCookie(
    request.cookies.get("kakao_session")?.value
  );
  const firebaseUser = parseJsonCookie(
    request.cookies.get("firebase_user")?.value
  );

  let purchaserId = null;
  let purchaserLoginType = null;

  if (kakaoSession) {
    purchaserId = `kakao_${kakaoSession.id}`;
    purchaserLoginType = "kakao";
  } else if (firebaseUser) {
    purchaserId = `google_${firebaseUser.uid}`;
    purchaserLoginType = "google";
  }

  if (!purchaserId) {
    console.warn("추천인 보상을 적용할 수 없습니다 - 사용자 정보 없음", {
      orderId,
      referralCode,
    });
    return;
  }

  try {
    const usageDocRef = doc(db, "referralUsages", orderId);
    const existingUsage = await getDoc(usageDocRef);

    if (existingUsage.exists()) {
      console.log("추천인 보상이 이미 처리되었습니다.", { orderId });
      return;
    }

    const codeQuery = query(
      collection(db, "referralCodes"),
      where("code", "==", referralCode.toUpperCase())
    );
    const codeSnapshot = await getDocs(codeQuery);

    if (codeSnapshot.empty) {
      console.warn("추천인 코드를 찾을 수 없습니다.", { referralCode });
      return;
    }

    const referralDoc = codeSnapshot.docs[0];
    const referralData = referralDoc.data();

    if (!referralData?.userId || referralData.userId === purchaserId) {
      console.warn("추천인 코드가 잘못되었거나 본인 코드입니다.", {
        purchaserId,
        referralOwner: referralData?.userId,
      });
      return;
    }

    const existingPurchaserUsage = await getDocs(
      query(
        collection(db, "referralUsages"),
        where("userId", "==", purchaserId)
      )
    );

    if (!existingPurchaserUsage.empty) {
      console.warn("사용자는 이미 추천인 할인을 사용했습니다.", {
        purchaserId,
        orderId,
      });
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      console.warn("추천인 보상 계산 실패 - 금액이 유효하지 않습니다.", {
        amount,
      });
      return;
    }

    const rewardAmount = Math.floor(numericAmount * 0.1);

    const usageData = {
      orderId,
      plan: plan ?? "yearly",
      userId: purchaserId,
      loginType: purchaserLoginType,
      referralCode: referralData.code,
      referrerUserId: referralData.userId,
      referrerName: referralData.ownerName ?? null,
      amount: numericAmount,
      rewardAmount,
      discountRate: 0.05,
      createdAt: new Date().toISOString(),
    };

    Object.keys(usageData).forEach((key) => {
      if (usageData[key] === null || usageData[key] === undefined) {
        delete usageData[key];
      }
    });

    await setDoc(usageDocRef, usageData);

    const referralOwnerDocRef = doc(db, "referralCodes", referralData.userId);

    await updateDoc(referralOwnerDocRef, {
      totalReward: increment(rewardAmount),
      usageCount: increment(1),
      lastRewardedAt: new Date().toISOString(),
    });

    console.log("추천인 보상 적용 완료", {
      orderId,
      referralCode: referralData.code,
      rewardAmount,
    });
  } catch (error) {
    console.error("추천인 보상 처리 실패:", error);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get("orderId");
  const paymentKey = searchParams.get("paymentKey");
  const amount = searchParams.get("amount");
  const plan = searchParams.get("plan") || "yearly";
  const referralCode = searchParams.get("referralCode");

  console.log("결제 성공 정보:", {
    orderId,
    paymentKey,
    amount,
    plan,
    referralCode,
  });

  await ensureLicenseForUser({ request, orderId, amount, plan, paymentKey });
  await rewardReferralIfNeeded({
    request,
    orderId,
    amount,
    plan,
    referralCode,
  });

  const secretKey = process.env.TOSSPAY_SECRET_KEY; // 시크릿 키는 환경변수로 관리
  const url = "https://api.tosspayments.com/v1/payments/confirm";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(secretKey + ":").toString(
          "base64"
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: parseInt(amount),
      }),
    });

    const result = await response.json();
    console.log("결제 승인 결과:", result);
  } catch (error) {
    console.error("결제 승인 실패:", error);
  }

  // 성공 페이지로 리다이렉트
  const successUrl = new URL("/purchase/success", request.url);
  successUrl.searchParams.set("orderId", orderId);
  successUrl.searchParams.set("amount", amount);
  successUrl.searchParams.set("plan", plan);
  if (referralCode) {
    successUrl.searchParams.set("referralCode", referralCode);
  }

  return NextResponse.redirect(successUrl);
}
