import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';

function parseJsonCookie(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('쿠키 파싱 실패:', error);
    return null;
  }
}

function generateLicenseCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function ensureLicenseForUser({ request, orderId, amount, plan, paymentKey }) {
  if (!orderId || plan !== 'yearly') {
    return;
  }

  const kakaoSession = parseJsonCookie(request.cookies.get('kakao_session')?.value);
  const firebaseUser = parseJsonCookie(request.cookies.get('firebase_user')?.value);

  let userId = null;
  let loginType = null;
  let userProfile = null;

  if (kakaoSession) {
    userId = `kakao_${kakaoSession.id}`;
    loginType = 'kakao';
    userProfile = {
      name: kakaoSession.nickname ?? kakaoSession.profile_nickname ?? kakaoSession.name ?? null,
      email: kakaoSession.email ?? null,
    };
  } else if (firebaseUser) {
    userId = `google_${firebaseUser.uid}`;
    loginType = 'google';
    userProfile = {
      name: firebaseUser.displayName ?? firebaseUser.email ?? null,
      email: firebaseUser.email ?? null,
    };
  }

  if (!userId) {
    console.warn('라이센스 생성 불가 - 사용자 정보를 찾을 수 없음', { orderId });
    return;
  }

  try {
    const existingQuery = query(
      collection(db, 'licenses'),
      where('orderId', '==', orderId),
      where('userId', '==', userId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      console.log('라이센스가 이미 존재합니다.', { orderId, userId });
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
      status: 'active',
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

    await setDoc(doc(db, 'licenses', licenseCode), licenseData);
    console.log('라이센스 생성 완료', { orderId, userId, licenseCode });
  } catch (error) {
    console.error('라이센스 생성 실패:', error);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');
  const plan = searchParams.get('plan') || 'yearly';

  console.log('결제 성공 정보:', {
    orderId,
    paymentKey,
    amount,
    plan,
  });

  await ensureLicenseForUser({ request, orderId, amount, plan, paymentKey });

  // 실제 프로젝트에서는 여기서 결제 승인 API를 호출해야 합니다
  // const secretKey = 'test_sk_...'; // 시크릿 키는 환경변수로 관리
  // const url = 'https://api.tosspayments.com/v1/payments/confirm';

  // try {
  //   const response = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       paymentKey,
  //       orderId,
  //       amount: parseInt(amount),
  //     }),
  //   });

  //   const result = await response.json();
  //   console.log('결제 승인 결과:', result);
  // } catch (error) {
  //   console.error('결제 승인 실패:', error);
  // }

  // 성공 페이지로 리다이렉트
  const successUrl = new URL('/purchase/success', request.url);
  successUrl.searchParams.set('orderId', orderId);
  successUrl.searchParams.set('amount', amount);
  successUrl.searchParams.set('plan', plan);

  return NextResponse.redirect(successUrl);
}
