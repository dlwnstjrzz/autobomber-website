import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // 모든 관련 쿠키 삭제
    const cookiesToDelete = [
      'kakao_session',
      'trial_data',
      'firebase_user'
    ];

    cookiesToDelete.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: cookieName === 'kakao_session' || cookieName === 'trial_data',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      });
    });

    return response;

  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json({ success: false, error: '로그아웃 실패' }, { status: 500 });
  }
}