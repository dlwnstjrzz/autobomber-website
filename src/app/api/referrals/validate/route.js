import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

function parseJsonCookie(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('쿠키 파싱 실패:', error);
    return null;
  }
}

function extractUserFromRequest(request) {
  const kakaoSession = parseJsonCookie(request.cookies.get('kakao_session')?.value);
  const firebaseUser = parseJsonCookie(request.cookies.get('firebase_user')?.value);

  if (kakaoSession) {
    return {
      userId: `kakao_${kakaoSession.id}`,
      loginType: 'kakao',
    };
  }

  if (firebaseUser) {
    return {
      userId: `google_${firebaseUser.uid}`,
      loginType: 'google',
    };
  }

  return null;
}

export async function POST(request) {
  try {
    const { code, originalPrice, plan } = await request.json();
    const sanitizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';

    if (!sanitizedCode) {
      return NextResponse.json(
        { success: false, error: '추천인 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = extractUserFromRequest(request);

    if (!user?.userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 추천인 코드 정보 조회
    const codeQuery = query(
      collection(db, 'referralCodes'),
      where('code', '==', sanitizedCode)
    );
    const codeSnapshot = await getDocs(codeQuery);

    if (codeSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 추천인 코드입니다.' },
        { status: 404 }
      );
    }

    const referralDoc = codeSnapshot.docs[0];
    const referralData = referralDoc.data();

    if (referralData.userId === user.userId) {
      return NextResponse.json(
        { success: false, error: '본인 추천인 코드는 사용할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 이미 추천인 할인을 사용한 사용자 여부 확인
    const usageQuery = query(
      collection(db, 'referralUsages'),
      where('userId', '==', user.userId)
    );
    const usageSnapshot = await getDocs(usageQuery);

    if (!usageSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: '추천인 할인은 계정당 1회만 사용할 수 있습니다.' },
        { status: 400 }
      );
    }

    const basePrice = typeof originalPrice === 'number' && originalPrice > 0
      ? Math.floor(originalPrice)
      : 239000;
    const discountRate = 0.05;
    const discountedPrice = Math.floor(basePrice * (1 - discountRate));
    const discountAmount = basePrice - discountedPrice;

    return NextResponse.json({
      success: true,
      discount: {
        referralCode: referralData.code,
        referrerUserId: referralData.userId,
        referrerName: referralData.ownerName ?? '추천인',
        plan: plan ?? 'yearly',
        originalPrice: basePrice,
        discountedPrice,
        discountAmount,
        discountRate,
      },
    });
  } catch (error) {
    console.error('추천인 코드 검증 실패:', error);
    return NextResponse.json(
      { success: false, error: '추천인 코드 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
