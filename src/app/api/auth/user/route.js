import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const kakaoSession = request.cookies.get('kakao_session')?.value;

    if (!kakaoSession) {
      return NextResponse.json({ user: null });
    }

    const userInfo = JSON.parse(kakaoSession);
    return NextResponse.json({ user: userInfo });

  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json({ user: null, error: '사용자 정보 조회 실패' });
  }
}