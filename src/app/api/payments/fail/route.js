import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');
  const plan = searchParams.get('plan') || 'yearly';

  console.log('결제 실패 정보:', {
    code,
    message,
    orderId,
    plan,
  });

  // 실패 페이지로 리다이렉트
  const failUrl = new URL('/purchase/failed', request.url);
  const errorMessage = message || code || '결제에 실패했습니다.';
  failUrl.searchParams.set('error', errorMessage);
  if (orderId) {
    failUrl.searchParams.set('orderId', orderId);
  }
  if (code) {
    failUrl.searchParams.set('code', code);
  }
  if (plan) {
    failUrl.searchParams.set('plan', plan);
  }

  return NextResponse.redirect(failUrl);
}
