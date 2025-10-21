import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
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

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function extractUserFromRequest(request) {
  const kakaoSession = parseJsonCookie(request.cookies.get('kakao_session')?.value);
  const firebaseUser = parseJsonCookie(request.cookies.get('firebase_user')?.value);

  if (kakaoSession) {
    return {
      userId: `kakao_${kakaoSession.id}`,
      loginType: 'kakao',
      displayName: kakaoSession.nickname ?? kakaoSession.profile_nickname ?? kakaoSession.name ?? '사용자',
      email: kakaoSession.email ?? null,
    };
  }

  if (firebaseUser) {
    return {
      userId: `google_${firebaseUser.uid}`,
      loginType: 'google',
      displayName: firebaseUser.displayName ?? firebaseUser.email ?? '사용자',
      email: firebaseUser.email ?? null,
    };
  }

  return null;
}

async function ensureUniqueCode() {
  let attempt = 0;
  while (attempt < 5) {
    const candidate = generateReferralCode();
    const codeQuery = query(
      collection(db, 'referralCodes'),
      where('code', '==', candidate)
    );
    const snapshot = await getDocs(codeQuery);
    if (snapshot.empty) {
      return candidate;
    }
    attempt += 1;
  }
  throw new Error('고유한 추천인 코드를 생성하지 못했습니다.');
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

    const docRef = doc(db, 'referralCodes', user.userId);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      return NextResponse.json({
        success: true,
        referral: existingDoc.data(),
        alreadyExists: true,
      });
    }

    const referralCode = await ensureUniqueCode();
    const now = new Date();

    const referralData = {
      userId: user.userId,
      loginType: user.loginType,
      ownerName: user.displayName,
      ownerEmail: user.email ?? null,
      code: referralCode,
      createdAt: now.toISOString(),
      totalReward: 0,
      usageCount: 0,
      pendingWithdrawalAmount: 0,
      withdrawnAmount: 0,
    };

    Object.keys(referralData).forEach((key) => {
      if (referralData[key] === null || referralData[key] === undefined) {
        delete referralData[key];
      }
    });

    await setDoc(docRef, referralData);

    return NextResponse.json({
      success: true,
      referral: referralData,
      alreadyExists: false,
    });
  } catch (error) {
    console.error('추천인 코드 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '추천인 코드 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
