import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';

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

    // Firestore에서 사용자의 모든 라이센스 조회
    const licensesQuery = query(
      collection(db, 'licenses'),
      where('userId', '==', userId)
    );

    const licensesSnapshot = await getDocs(licensesQuery);
    const licenses = [];

    licensesSnapshot.forEach((doc) => {
      const licenseData = doc.data();
      const createdAt = new Date(licenseData.createdAt);
      const expiresAt = new Date(licenseData.expiresAt);
      const now = new Date();
      const isExpired = now > expiresAt;
      const remainingTime = isExpired ? 0 : expiresAt.getTime() - now.getTime();

      licenses.push({
        ...licenseData,
        isExpired,
        remainingTime
      });
    });

    // 생성일 기준 내림차순 정렬 (최신순)
    licenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      licenses
    });

  } catch (error) {
    console.error('라이센스 목록 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '라이센스 목록 조회에 실패했습니다.'
    }, { status: 500 });
  }
}