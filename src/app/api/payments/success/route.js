import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const paymentType = searchParams.get('paymentType');
  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');

  console.log('결제 성공 정보:', {
    paymentType,
    orderId,
    paymentKey,
    amount,
  });

  // 실제 프로젝트에서는 여기서 결제 승인 API를 호출해야 합니다
  // const secretKey = 'test_sk_...'; // 시크릿 키는 환경변수로 관리
  // const url = 'https://api.tosspayments.com/v1/payments/confirm';

  // try {
  //   const response = await fetch(url, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       paymentKey,
  //       orderId,
  //       amount: parseInt(amount),
  //     }),
  //   });

  //   const result = await response.json();
  //   console.log('결제 승인 결과:', result);
  // } catch (error) {
  //   console.error('결제 승인 실패:', error);
  // }

  // 성공 페이지로 리다이렉트
  const successUrl = new URL('/buy/success', request.url);
  successUrl.searchParams.set('orderId', orderId);
  successUrl.searchParams.set('amount', amount);

  return NextResponse.redirect(successUrl);
}