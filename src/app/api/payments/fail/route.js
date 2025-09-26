import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  console.log('결제 실패 정보:', {
    code,
    message,
    orderId,
  });

  // 실패 페이지로 리다이렉트
  const failUrl = new URL('/buy/fail', request.url);
  failUrl.searchParams.set('code', code);
  failUrl.searchParams.set('message', message);
  failUrl.searchParams.set('orderId', orderId);

  return NextResponse.redirect(failUrl);
}