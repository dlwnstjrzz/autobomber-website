import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CLIENT_ID = process.env.NICEPAY_CLIENT_ID;
const SECRET_KEY = process.env.NICEPAY_SECRET_KEY;

export async function POST(request) {
  try {
    const { amount, orderId, goodsName, buyerName, buyerTel, buyerEmail } = await request.json();
    
    // 주문 ID 생성 (현재 시간 + 랜덤)
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const finalOrderId = orderId || `order_${timestamp}_${randomId}`;
    
    // 결제 준비 데이터
    const paymentData = {
      clientId: CLIENT_ID,
      method: 'card',
      orderId: finalOrderId,
      amount: amount,
      goodsName: goodsName,
      buyerName: buyerName,
      buyerTel: buyerTel,
      buyerEmail: buyerEmail,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/callback`,
      mallReserved: JSON.stringify({
        userId: buyerEmail,
        plan: goodsName.includes('1년') ? 'yearly' : 'trial'
      })
    };
    
    return NextResponse.json({
      success: true,
      paymentData,
      orderId: finalOrderId
    });
    
  } catch (error) {
    console.error('Payment preparation error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment preparation failed' },
      { status: 500 }
    );
  }
}