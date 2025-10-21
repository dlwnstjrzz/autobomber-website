import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  increment,
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

export async function PATCH(request, { params }) {
  try {
    const adminUser = extractUserFromRequest(request);

    if (!adminUser?.userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!isAuthorizedAdmin(adminUser)) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const withdrawalId = params?.id;
    if (!withdrawalId) {
      return NextResponse.json(
        { success: false, error: '출금 신청 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes } = body ?? {};

    if (!status || !['completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효한 상태(completed, rejected)를 지정해주세요.' },
        { status: 400 }
      );
    }

    const withdrawalDocRef = doc(db, 'referralWithdrawals', withdrawalId);
    const withdrawalDoc = await getDoc(withdrawalDocRef);

    if (!withdrawalDoc.exists()) {
      return NextResponse.json(
        { success: false, error: '출금 신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const withdrawalData = withdrawalDoc.data();
    const currentStatus = withdrawalData.status ?? 'pending';

    if (currentStatus !== 'pending') {
      return NextResponse.json(
        { success: false, error: '이미 처리된 출금 신청입니다.' },
        { status: 400 }
      );
    }

    const amount = Number(withdrawalData.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: '출금 금액이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    const referralUserId = withdrawalData.userId;
    if (!referralUserId) {
      return NextResponse.json(
        { success: false, error: '추천인 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    const referralDocRef = doc(db, 'referralCodes', referralUserId);
    const referralDoc = await getDoc(referralDocRef);

    if (!referralDoc.exists()) {
      return NextResponse.json(
        { success: false, error: '추천인 코드 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const processedAt = new Date().toISOString();

    const withdrawalUpdates = {
      status,
      updatedAt: processedAt,
      processedAt,
      processedBy: adminUser.email ?? adminUser.userId,
    };

    if (notes && typeof notes === 'string') {
      withdrawalUpdates.notes = notes;
    }

    await updateDoc(withdrawalDocRef, withdrawalUpdates);

    const referralData = referralDoc.data();
    const currentPending = Number(referralData.pendingWithdrawalAmount ?? 0);
    const nextPending = Math.max(currentPending - amount, 0);

    const referralUpdates = {
      pendingWithdrawalAmount: nextPending,
      lastWithdrawalProcessedAt: processedAt,
    };

    if (status === 'completed') {
      referralUpdates.withdrawnAmount = increment(amount);
    }

    await updateDoc(referralDocRef, referralUpdates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('출금 신청 상태 변경 실패:', error);
    return NextResponse.json(
      { success: false, error: '출금 신청 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
