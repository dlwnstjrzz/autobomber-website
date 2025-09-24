import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const COLLECTIONS = [
  { name: 'licenses', type: 'license' },
  { name: 'trials', type: 'trial' }
];

function buildActivationPayload(code, type, data, options = {}) {
  const now = new Date();
  const createdAt = data?.createdAt ? new Date(data.createdAt) : null;
  const expiresAt = data?.expiresAt ? new Date(data.expiresAt) : null;
  const statusFromDb = data?.status ?? 'unknown';
  const registeredDeviceId = data?.deviceId ?? null;
  const deviceRegisteredAt = data?.deviceRegisteredAt ? new Date(data.deviceRegisteredAt) : null;
  const lastValidatedAt = data?.lastValidatedAt ? new Date(data.lastValidatedAt) : null;
  const requestedDeviceId = options.deviceId ?? null;

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
    registeredDeviceId,
    deviceRegisteredAt: deviceRegisteredAt ? deviceRegisteredAt.toISOString() : null,
    isDeviceRegistered: Boolean(registeredDeviceId),
    isDeviceMatched: registeredDeviceId ? registeredDeviceId === requestedDeviceId : false,
    lastValidatedAt: lastValidatedAt ? lastValidatedAt.toISOString() : null,
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

export async function POST(request, { params }) {
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

    let payload;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: '요청 본문을 JSON 형식으로 보내주세요.'
      }, { status: 400 });
    }

    const bodyCode = typeof payload?.code === 'string' ? payload.code.trim().toUpperCase() : null;
    const deviceId = typeof payload?.deviceId === 'string' ? payload.deviceId.trim() : '';

    if (bodyCode && bodyCode !== code) {
      return NextResponse.json({
        success: false,
        error: '요청 경로의 코드와 본문에 포함된 코드가 일치하지 않습니다.'
      }, { status: 400 });
    }

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: '기기 고유 ID를 입력해주세요.'
      }, { status: 400 });
    }

    for (const collectionInfo of COLLECTIONS) {
      const docRef = doc(db, collectionInfo.name, code);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        continue;
      }

      const data = docSnap.data();
      const activation = buildActivationPayload(
        data?.code ?? code,
        collectionInfo.type,
        data,
        { deviceId }
      );

      if (activation.isExpired) {
        return NextResponse.json({
          success: false,
          error: '활성화 코드가 만료되었습니다.',
          activation
        }, { status: 410 });
      }

      if (activation.registeredDeviceId && activation.registeredDeviceId !== deviceId) {
        return NextResponse.json({
          success: false,
          error: '이미 다른 기기에 등록된 코드입니다.',
          activation
        }, { status: 409 });
      }

      const nowIso = new Date().toISOString();
      let deviceRegisteredAtValue = data?.deviceRegisteredAt ?? null;

      if (!activation.registeredDeviceId) {
        deviceRegisteredAtValue = deviceRegisteredAtValue ?? nowIso;
        await updateDoc(docRef, {
          deviceId,
          deviceRegisteredAt: deviceRegisteredAtValue,
          lastValidatedAt: nowIso
        });
      } else {
        const updatePayload = { lastValidatedAt: nowIso };
        if (!deviceRegisteredAtValue) {
          deviceRegisteredAtValue = nowIso;
          updatePayload.deviceRegisteredAt = deviceRegisteredAtValue;
        }
        await updateDoc(docRef, updatePayload);
      }

      const updatedActivation = buildActivationPayload(
        data?.code ?? code,
        collectionInfo.type,
        {
          ...data,
          deviceId,
          deviceRegisteredAt: deviceRegisteredAtValue,
          lastValidatedAt: nowIso
        },
        { deviceId }
      );

      return NextResponse.json({
        success: true,
        activation: updatedActivation
      });
    }

    return NextResponse.json({
      success: false,
      error: '존재하지 않는 활성화 코드입니다.'
    }, { status: 404 });

  } catch (error) {
    console.error('활성화 코드 등록 오류:', error);
    return NextResponse.json({
      success: false,
      error: '활성화 코드 등록 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
