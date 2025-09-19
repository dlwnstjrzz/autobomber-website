import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    // 모든 trial 데이터 조회하여 userId 형식 확인
    const trialsCollection = collection(db, 'trials');
    const trialsSnapshot = await getDocs(trialsCollection);

    const allTrials = [];
    trialsSnapshot.forEach(doc => {
      allTrials.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('모든 체험 데이터:', allTrials);

    return NextResponse.json({
      success: true,
      count: allTrials.length,
      trials: allTrials
    });

  } catch (error) {
    console.error('디버그 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}