import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: '주문번호가 필요합니다.'
      }, { status: 400 });
    }

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

    // Firestore에서 주문번호로 라이센스 조회
    const licensesQuery = query(
      collection(db, 'licenses'),
      where('orderId', '==', orderId),
      where('userId', '==', userId)
    );

    const licensesSnapshot = await getDocs(licensesQuery);

    if (licensesSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: '라이센스를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 첫 번째 라이센스 문서 가져오기
    const licenseDoc = licensesSnapshot.docs[0];
    const licenseData = licenseDoc.data();

    // 만료일 계산
    const createdAt = new Date(licenseData.createdAt);
    const expiresAt = new Date(licenseData.expiresAt);
    const now = new Date();
    const isExpired = now > expiresAt;
    const remainingTime = isExpired ? 0 : expiresAt.getTime() - now.getTime();

    return NextResponse.json({
      success: true,
      license: {
        ...licenseData,
        isExpired,
        remainingTime
      }
    });

  } catch (error) {
    console.error('라이센스 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '라이센스 조회에 실패했습니다.'
    }, { status: 500 });
  }
}