import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  try {
    // 사용자 인증 확인
    const kakaoSession = request.cookies.get('kakao_session')?.value;
    const firebaseUser = request.cookies.get('firebase_user')?.value;

    let userId = null;
    let userInfo = null;

    if (kakaoSession) {
      userInfo = JSON.parse(kakaoSession);
      userId = `kakao_${userInfo.id}`;
    } else if (firebaseUser) {
      userInfo = JSON.parse(firebaseUser);
      userId = `google_${userInfo.uid}`;
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    // Firestore에서 할인 코드 조회
    const discountDocRef = doc(db, 'discountCodes', userId);
    const discountDoc = await getDoc(discountDocRef);

    if (!discountDoc.exists()) {
      return NextResponse.json({
        success: true,
        hasDiscount: false,
        discount: null
      });
    }

    const discountData = discountDoc.data();
    const now = new Date();
    const expiresAt = new Date(discountData.expiresAt);
    const isExpired = now > expiresAt;
    const remainingTime = isExpired ? 0 : expiresAt.getTime() - now.getTime();

    return NextResponse.json({
      success: true,
      hasDiscount: true,
      discount: {
        ...discountData,
        isExpired,
        remainingTime
      }
    });

  } catch (error) {
    console.error('할인 코드 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '할인 코드 조회에 실패했습니다.'
    }, { status: 500 });
  }
}