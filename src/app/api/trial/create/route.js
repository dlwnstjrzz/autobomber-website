import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { cookies } from 'next/headers';

function generateTrialCode() {
  // 6자리 영문 대문자 + 숫자 조합
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request) {
  try {
    // 사용자 인증 확인 (카카오 또는 구글)
    const kakaoSession = request.cookies.get('kakao_session')?.value;

    let userId = null;
    let userInfo = null;
    let loginType = null;

    if (kakaoSession) {
      // 카카오 로그인 사용자
      userInfo = JSON.parse(kakaoSession);
      userId = `kakao_${userInfo.id}`;
      loginType = 'kakao';
    } else {
      // Firebase 구글 로그인 사용자 확인
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // 클라이언트에서 Firebase ID Token을 보낸 경우
        const idToken = authHeader.split('Bearer ')[1];

        try {
          // Firebase Admin SDK가 있다면 토큰 검증하겠지만, 일단 간단하게 처리
          // 실제로는 Firebase Admin SDK로 토큰 검증해야 함

          // 임시로 쿠키에서 사용자 정보 확인
          const firebaseUser = request.cookies.get('firebase_user')?.value;
          if (firebaseUser) {
            userInfo = JSON.parse(firebaseUser);
            userId = `google_${userInfo.uid}`;
            loginType = 'google';
          }
        } catch (error) {
          console.error('Firebase 토큰 검증 오류:', error);
        }
      } else {
        // 쿠키에서 Firebase 사용자 정보 확인
        const firebaseUser = request.cookies.get('firebase_user')?.value;
        if (firebaseUser) {
          userInfo = JSON.parse(firebaseUser);
          userId = `google_${userInfo.uid}`;
          loginType = 'google';
        }
      }
    }

    if (!userId || !userInfo) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    // Firestore에서 해당 사용자의 체험 이력 확인
    const trialsQuery = query(
      collection(db, 'trials'),
      where('userId', '==', userId)
    );

    const trialsSnapshot = await getDocs(trialsQuery);

    if (!trialsSnapshot.empty) {
      // 이미 체험을 사용한 계정
      return NextResponse.json({
        success: false,
        error: '이미 무료 체험을 사용한 계정입니다. 계정당 1회만 이용 가능합니다.'
      }, { status: 400 });
    }

    // 다시 한번 중복 체크 (동시 요청 방지)
    const doubleCheckQuery = query(
      collection(db, 'trials'),
      where('userId', '==', userId)
    );
    const doubleCheckSnapshot = await getDocs(doubleCheckQuery);

    if (!doubleCheckSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: '이미 무료 체험을 사용한 계정입니다.'
      }, { status: 400 });
    }

    // 체험 코드 생성
    const trialCode = generateTrialCode();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24시간 후

    const trialData = {
      userId: userId,
      loginType: loginType,
      nickname: loginType === 'kakao' ? userInfo.nickname || '사용자' : userInfo.displayName || '사용자',
      profileImage: loginType === 'kakao' ? userInfo.profile_image || null : userInfo.photoURL || null,
      email: loginType === 'kakao' ? userInfo.email || null : userInfo.email || null,
      code: trialCode,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active' // active, expired, used
    };

    // undefined 값 제거
    Object.keys(trialData).forEach(key => {
      if (trialData[key] === undefined) {
        delete trialData[key];
      }
    });

    console.log('저장할 체험 데이터:', trialData);

    // Firestore에 체험 기록 저장
    const trialDocRef = doc(db, 'trials', trialCode);
    await setDoc(trialDocRef, trialData);

    console.log(`체험 코드 생성 완료: ${trialCode} for user: ${userId}`); // 디버깅용

    // 쿠키에 체험 정보 저장
    const response = NextResponse.json({
      success: true,
      trial: trialData
    });

    response.cookies.set('trial_data', JSON.stringify(trialData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일 (체험은 1일이지만 기록은 7일 보관)
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('체험 코드 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '체험 코드 생성에 실패했습니다.'
    }, { status: 500 });
  }
}