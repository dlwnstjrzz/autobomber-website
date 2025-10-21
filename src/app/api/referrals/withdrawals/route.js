import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
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

    const withdrawalsQuery = query(
      collection(db, 'referralWithdrawals'),
      where('userId', '==', user.userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(withdrawalsQuery);
    const withdrawals = [];

    snapshot.forEach((docSnap) => {
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

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error('출금 신청 내역 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '출금 신청 내역을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = extractUserFromRequest(request);

    if (!user?.userId) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.trim() : '';
    const accountHolder = typeof body.accountHolder === 'string' ? body.accountHolder.trim() : '';

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: '유효한 출금 금액을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!accountNumber || accountNumber.length < 6) {
      return NextResponse.json(
        { success: false, error: '유효한 계좌번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!accountHolder) {
      return NextResponse.json(
        { success: false, error: '예금주 이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    const referralDocRef = doc(db, 'referralCodes', user.userId);
    const referralDoc = await getDoc(referralDocRef);

    if (!referralDoc.exists()) {
      return NextResponse.json(
        { success: false, error: '추천인 코드가 존재하지 않습니다.' },
        { status: 400 }
      );
    }

    const referralData = referralDoc.data();
    const totalReward = Number(referralData.totalReward ?? 0);
    const pendingWithdrawalAmount = Number(referralData.pendingWithdrawalAmount ?? 0);
    const withdrawnAmount = Number(referralData.withdrawnAmount ?? 0);
    const availableAmount = Math.max(totalReward - pendingWithdrawalAmount - withdrawnAmount, 0);

    if (amount > availableAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `출금 가능 금액은 ₩${availableAmount.toLocaleString()} 입니다.`,
        },
        { status: 400 }
      );
    }

    const newRequest = {
      userId: user.userId,
      referralCode: referralData.code ?? null,
      amount,
      accountNumber,
      accountHolder,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginType: referralData.loginType ?? null,
      ownerName: referralData.ownerName ?? user.nickname ?? '사용자',
      ownerEmail: referralData.ownerEmail ?? user.email ?? null,
    };

    Object.keys(newRequest).forEach((key) => {
      if (newRequest[key] === undefined || newRequest[key] === null) {
        delete newRequest[key];
      }
    });

    await addDoc(collection(db, 'referralWithdrawals'), newRequest);

    await updateDoc(referralDocRef, {
      pendingWithdrawalAmount: increment(amount),
      lastWithdrawalRequestAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: '출금 신청이 접수되었습니다.',
    });
  } catch (error) {
    console.error('출금 신청 실패:', error);
    return NextResponse.json(
      { success: false, error: '출금 신청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
