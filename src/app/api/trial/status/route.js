import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';

export async function GET(request) {
  try {
    // 사용자 인증 확인 (카카오 또는 구글)
    const kakaoSession = request.cookies.get('kakao_session')?.value;
    const firebaseUser = request.cookies.get('firebase_user')?.value;

    let userId = null;
    let loginType = null;

    if (kakaoSession) {
      const userInfo = JSON.parse(kakaoSession);
      userId = `kakao_${userInfo.id}`;
      loginType = 'kakao';
      console.log('카카오 사용자 조회:', userId, userInfo);
    } else if (firebaseUser) {
      const userInfo = JSON.parse(firebaseUser);
      userId = `google_${userInfo.uid}`;
      loginType = 'google';
      console.log('구글 사용자 조회:', userId, userInfo);
    }

    if (!userId) {
      console.log('사용자 인증 실패 - 쿠키 없음');
      return NextResponse.json({
        hasTrial: false,
        trial: null,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    console.log('체험 조회 시작 - userId:', userId);

    // Firestore에서 해당 사용자의 체험 기록 조회
    const trialsQuery = query(
      collection(db, 'trials'),
      where('userId', '==', userId)
    );

    const trialsSnapshot = await getDocs(trialsQuery);

    console.log('Firestore 조회 결과:', trialsSnapshot.size, '개 문서 발견');

    if (trialsSnapshot.empty) {
      console.log('체험 기록 없음 - userId:', userId);
      return NextResponse.json({
        hasTrial: false,
        trial: null
      });
    }

    // 가장 최신 체험 기록 찾기 (클라이언트에서 정렬)
    let latestTrial = null;
    let latestDate = null;

    trialsSnapshot.forEach(doc => {
      const trial = doc.data();
      const createdAt = new Date(trial.createdAt);

      if (!latestDate || createdAt > latestDate) {
        latestDate = createdAt;
        latestTrial = trial;
      }
    });

    const trial = latestTrial;
    console.log('발견된 체험 데이터:', trial);

    const now = new Date();
    const expiresAt = new Date(trial.expiresAt);

    // 만료 여부 확인
    const isExpired = now > expiresAt;

    const result = {
      hasTrial: true,
      trial: {
        ...trial,
        isExpired,
        remainingTime: isExpired ? 0 : Math.max(0, expiresAt.getTime() - now.getTime())
      }
    };

    console.log('반환할 데이터:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('체험 상태 조회 오류:', error);
    return NextResponse.json({
      hasTrial: false,
      trial: null,
      error: '체험 상태 조회에 실패했습니다.'
    }, { status: 500 });
  }
}