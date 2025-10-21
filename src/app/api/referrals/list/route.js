import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

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
      email: kakaoSession.email ?? null,
    };
  }

  if (firebaseUser) {
    return {
      userId: `google_${firebaseUser.uid}`,
      email: firebaseUser.email ?? null,
    };
  }

  return null;
}

function isAuthorizedAdmin(user) {
  const defaultEmails = ['dlwnstjr37@gmail.com'];
  const configuredEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map((item) => item.trim()).filter(Boolean)
    : null;
  const allowedEmails = configuredEmails && configuredEmails.length > 0 ? configuredEmails : defaultEmails;

  if (!user?.email) {
    return false;
  }

  return allowedEmails.includes(user.email);
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

    if (!isAuthorizedAdmin(user)) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const [referralSnapshot, withdrawalSnapshot] = await Promise.all([
      getDocs(collection(db, 'referralCodes')),
      getDocs(collection(db, 'referralWithdrawals')),
    ]);

    const withdrawalMap = {};

    withdrawalSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.userId) return;
      if (!withdrawalMap[data.userId]) {
        withdrawalMap[data.userId] = {
          requests: [],
          pendingAmount: 0,
          hasPending: false,
        };
      }

      const requestInfo = {
        id: docSnap.id,
        amount: data.amount ?? 0,
        status: data.status ?? 'pending',
        createdAt: data.createdAt ?? null,
        processedAt: data.processedAt ?? null,
        accountHolder: data.accountHolder ?? null,
      };

      withdrawalMap[data.userId].requests.push(requestInfo);

      if ((data.status ?? 'pending') === 'pending') {
        withdrawalMap[data.userId].pendingAmount += Number(data.amount ?? 0);
        withdrawalMap[data.userId].hasPending = true;
      }
    });

    Object.values(withdrawalMap).forEach((entry) => {
      entry.requests.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      entry.latest = entry.requests[0] ?? null;
    });

    const referrals = [];

    referralSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const totalReward = Number(data.totalReward ?? 0);
      const pendingWithdrawalAmount = Number(data.pendingWithdrawalAmount ?? 0);
      const usageCount = Number(data.usageCount ?? 0);

      if (totalReward <= 0 && pendingWithdrawalAmount <= 0) {
        return;
      }

      const withdrawalInfo = withdrawalMap[data.userId] ?? {
        pendingAmount: pendingWithdrawalAmount,
        hasPending: pendingWithdrawalAmount > 0,
        latest: null,
        requests: [],
      };

      referrals.push({
        userId: data.userId,
        code: data.code,
        ownerName: data.ownerName ?? '사용자',
        ownerEmail: data.ownerEmail ?? null,
        loginType: data.loginType ?? null,
        totalReward,
        usageCount,
        createdAt: data.createdAt ?? null,
        lastRewardedAt: data.lastRewardedAt ?? null,
        pendingWithdrawalAmount,
        withdrawnAmount: Number(data.withdrawnAmount ?? 0),
        lastWithdrawalRequestAt: data.lastWithdrawalRequestAt ?? null,
        hasPendingWithdrawal: withdrawalInfo.hasPending || pendingWithdrawalAmount > 0,
        latestWithdrawal: withdrawalInfo.latest,
        withdrawalRequests: withdrawalInfo.requests ?? [],
      });
    });

    referrals.sort((a, b) => (b.totalReward || 0) - (a.totalReward || 0));

    return NextResponse.json({
      success: true,
      referrals,
      totalReward: referrals.reduce((sum, item) => sum + (item.totalReward || 0), 0),
      totalUsageCount: referrals.reduce((sum, item) => sum + (item.usageCount || 0), 0),
      totalPendingWithdrawals: referrals.reduce(
        (sum, item) => sum + (item.pendingWithdrawalAmount || 0),
        0
      ),
      totalWithdrawnAmount: referrals.reduce(
        (sum, item) => sum + (item.withdrawnAmount || 0),
        0
      ),
    });
  } catch (error) {
    console.error('추천인 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '추천인 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
