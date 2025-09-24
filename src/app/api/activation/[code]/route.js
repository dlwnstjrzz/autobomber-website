import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const COLLECTIONS = [
  { name: 'licenses', type: 'license' },
  { name: 'trials', type: 'trial' }
];

function buildActivationPayload(code, type, data) {
  const now = new Date();
  const createdAt = data?.createdAt ? new Date(data.createdAt) : null;
  const expiresAt = data?.expiresAt ? new Date(data.expiresAt) : null;
  const statusFromDb = data?.status ?? 'unknown';

  const isExpiredByTime = expiresAt ? now > expiresAt : false;
  const effectiveStatus = isExpiredByTime && statusFromDb === 'active'
    ? 'expired'
    : statusFromDb;

  return {
    code,
    type,
    status: effectiveStatus,
    isExpired: effectiveStatus === 'expired' || isExpiredByTime,
    createdAt: createdAt ? createdAt.toISOString() : null,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    remainingTimeMs: expiresAt && now <= expiresAt ? Math.max(0, expiresAt.getTime() - now.getTime()) : 0,
    plan: data?.plan ?? (type === 'license' ? 'yearly' : type),
    metadata: {
      amount: type === 'license' ? data?.amount ?? null : null,
      durationHours: expiresAt && createdAt ? Math.round((expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)) : null
    }
  };
}

export async function GET(_request, { params }) {
  try {
    const rawCode = params?.code;

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json({
        success: false,
        error: '활성화 코드가 필요합니다.'
      }, { status: 400 });
    }

    const code = rawCode.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({
        success: false,
        error: '유효한 활성화 코드를 입력해주세요.'
      }, { status: 400 });
    }

    for (const collectionInfo of COLLECTIONS) {
      const docRef = doc(db, collectionInfo.name, code);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const activation = buildActivationPayload(
          data?.code ?? code,
          collectionInfo.type,
          data
        );

        return NextResponse.json({
          success: true,
          activation
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: '존재하지 않는 활성화 코드입니다.'
    }, { status: 404 });
  } catch (error) {
    console.error('활성화 코드 확인 오류:', error);
    return NextResponse.json({
      success: false,
      error: '활성화 코드 확인 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
