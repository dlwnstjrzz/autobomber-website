import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request, { params }) {
  try {
    const { code } = params;

    if (!code) {
      return NextResponse.json({
        success: false,
        error: '체험 코드가 필요합니다.'
      }, { status: 400 });
    }

    // Firestore에서 체험 코드로 조회
    const trialDocRef = doc(db, 'trials', code);
    const trialDoc = await getDoc(trialDocRef);

    if (!trialDoc.exists()) {
      return NextResponse.json({
        success: false,
        error: '존재하지 않는 체험 코드입니다.'
      }, { status: 404 });
    }

    const trialData = trialDoc.data();

    // 만료 시간 확인
    const now = new Date();
    const expiresAt = new Date(trialData.expiresAt);

    if (now > expiresAt) {
      trialData.status = 'expired';
    }

    return NextResponse.json({
      success: true,
      trial: trialData
    });

  } catch (error) {
    console.error('체험 정보 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '체험 정보 조회에 실패했습니다.'
    }, { status: 500 });
  }
}