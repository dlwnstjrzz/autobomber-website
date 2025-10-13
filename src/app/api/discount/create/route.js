import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function generateDiscountCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'DISC';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request) {
  try {
    // 사용자 인증 확인
    const kakaoSession = request.cookies.get('kakao_session')?.value;
    const firebaseUser = request.cookies.get('firebase_user')?.value;

    let userId = null;
    let userInfo = null;
    let loginType = null;

    if (kakaoSession) {
      userInfo = JSON.parse(kakaoSession);
      userId = `kakao_${userInfo.id}`;
      loginType = 'kakao';
    } else if (firebaseUser) {
      userInfo = JSON.parse(firebaseUser);
      userId = `google_${userInfo.uid}`;
      loginType = 'google';
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    // 기존 할인 코드가 있는지 확인
    const discountDocRef = doc(db, 'discountCodes', userId);
    const existingDiscount = await getDoc(discountDocRef);

    if (existingDiscount.exists()) {
      const discountData = existingDiscount.data();
      const now = new Date();
      const expiresAt = new Date(discountData.expiresAt);

      // 아직 유효한 할인 코드가 있으면 그것을 반환
      if (now < expiresAt) {
        return NextResponse.json({
          success: true,
          discount: discountData
        });
      }
    }

    // 새로운 할인 코드 생성
    const discountCode = generateDiscountCode();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

    const discountData = {
      userId: userId,
      loginType: loginType,
      nickname: loginType === 'kakao' ? userInfo.nickname || '사용자' : userInfo.displayName || '사용자',
      code: discountCode,
      discountAmount: 10000,
      originalPrice: 239000,
      discountedPrice: 229000,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isUsed: false,
      status: 'active'
    };

    // undefined 값 제거
    Object.keys(discountData).forEach(key => {
      if (discountData[key] === undefined) {
        delete discountData[key];
      }
    });

    console.log('저장할 할인 코드 데이터:', discountData);

    // Firestore에 할인 코드 저장
    await setDoc(discountDocRef, discountData);

    console.log(`할인 코드 생성 완료: ${discountCode} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      discount: discountData
    });

  } catch (error) {
    console.error('할인 코드 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '할인 코드 생성에 실패했습니다.'
    }, { status: 500 });
  }
}