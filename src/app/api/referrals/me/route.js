import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

function parseJsonCookie(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('쿠키 파싱 실패:', error);
    return null;
  }
}

function extractUserFromRequest(request) {
  const kakaoSession = parseJsonCookie(request.cookies.get('kakao_session')?.value);
  const firebaseUser = parseJsonCookie(request.cookies.get('firebase_user')?.value);

  if (kakaoSession) {
    return {
      userId: `kakao_${kakaoSession.id}`,
      loginType: 'kakao',
      nickname: kakaoSession.nickname ?? kakaoSession.profile_nickname ?? kakaoSession.name ?? '사용자',
      email: kakaoSession.email ?? null,
    };
  }

  if (firebaseUser) {
    return {
      userId: `google_${firebaseUser.uid}`,
      loginType: 'google',
      nickname: firebaseUser.displayName ?? firebaseUser.email ?? '사용자',
      email: firebaseUser.email ?? null,
    };
  }

  return null;
}

export async function GET(request) {
  try {
    const user = extractUserFromRequest(request);

    if (!user?.userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const referralDocRef = doc(db, 'referralCodes', user.userId);
    const referralDoc = await getDoc(referralDocRef);

    if (!referralDoc.exists()) {
      return NextResponse.json({
        success: true,
        hasCode: false,
        referral: null,
        totalReward: 0,
        usageCount: 0,
        pendingWithdrawalAmount: 0,
        referralUsages: [],
        withdrawals: [],
        withdrawnAmount: 0,
        hasUsedReferralDiscount: false,
      });
    }

    const referralData = referralDoc.data();

    const discountUsageQuery = query(
      collection(db, 'referralUsages'),
      where('userId', '==', user.userId)
    );
    const discountUsageSnapshot = await getDocs(discountUsageQuery);

    const referralUsageQuery = query(
      collection(db, 'referralUsages'),
      where('referrerUserId', '==', user.userId)
    );
    const referralUsageSnapshot = await getDocs(referralUsageQuery);
    
    const referralUsages = [];
    referralUsageSnapshot.forEach((docSnap) => {
      const usage = docSnap.data();
      referralUsages.push({
        id: docSnap.id,
        orderId: usage.orderId ?? null,
        amount: usage.amount ?? 0,
        rewardAmount: usage.rewardAmount ?? 0,
        createdAt: usage.createdAt ?? null,
        plan: usage.plan ?? null,
        status: usage.status ?? 'completed',
      });
    });
    referralUsages.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    const limitedReferralUsages = referralUsages.slice(0, 20);

    const withdrawalQuery = query(
      collection(db, 'referralWithdrawals'),
      where('userId', '==', user.userId)
    );
    const withdrawalSnapshot = await getDocs(withdrawalQuery);
    const withdrawals = [];
    withdrawalSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      withdrawals.push({
        id: docSnap.id,
        amount: data.amount ?? 0,
        accountNumber: data.accountNumber ?? null,
        accountHolder: data.accountHolder ?? null,
        status: data.status ?? 'pending',
        createdAt: data.createdAt ?? null,
        processedAt: data.processedAt ?? null,
        notes: data.notes ?? null,
      });
    });
    withdrawals.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    const limitedWithdrawals = withdrawals.slice(0, 20);

    return NextResponse.json({
      success: true,
      hasCode: true,
      referral: referralData,
      totalReward: referralData.totalReward ?? 0,
      usageCount: referralData.usageCount ?? 0,
      pendingWithdrawalAmount: referralData.pendingWithdrawalAmount ?? 0,
      withdrawnAmount: referralData.withdrawnAmount ?? 0,
      referralUsages: limitedReferralUsages,
      withdrawals: limitedWithdrawals,
      hasUsedReferralDiscount: !discountUsageSnapshot.empty,
    });
  } catch (error) {
    console.error('추천인 코드 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '추천인 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
