"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useDiscountEligibility() {
  const [discountData, setDiscountData] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsEligible(false);
      setDiscountData(null);
      setLoading(false);
      return;
    }

    checkEligibility();
  }, [user, authLoading]);

  const checkEligibility = async () => {
    try {
      // 1. 기존 할인 코드가 있는지 확인
      const discountResponse = await fetch('/api/discount/status');
      const existingDiscount = await discountResponse.json();

      if (existingDiscount.success && existingDiscount.hasDiscount && !existingDiscount.discount.isExpired) {
        // 유효한 할인 코드가 있으면 바로 표시
        setDiscountData(existingDiscount.discount);
        setIsEligible(true);
        setLoading(false);
        return;
      }

      // 2. 무료체험 상태 확인
      const trialResponse = await fetch('/api/trial/status');
      const trialData = await trialResponse.json();

      // 3. 1년 이용권 구매 내역 확인
      const licensesResponse = await fetch('/api/licenses');
      const licensesData = await licensesResponse.json();

      // 조건 확인:
      // - 무료체험을 사용했고 만료됨
      // - 1년 이용권을 구매하지 않음
      const hasExpiredTrial = trialData.hasTrial && trialData.trial?.isExpired;
      const hasNoLicenses = !licensesData.success || licensesData.licenses.length === 0;

      console.log('할인 자격 확인:', {
        hasExpiredTrial,
        hasNoLicenses,
        trialData: trialData.trial,
        licensesCount: licensesData.licenses?.length || 0
      });

      if (hasExpiredTrial && hasNoLicenses) {
        // 조건을 만족하면 할인 코드 생성
        const createResponse = await fetch('/api/discount/create', {
          method: 'POST'
        });
        const createData = await createResponse.json();

        if (createData.success) {
          setDiscountData(createData.discount);
          setIsEligible(true);
        } else {
          setIsEligible(false);
          setDiscountData(null);
        }
      } else {
        setIsEligible(false);
        setDiscountData(null);
      }
    } catch (error) {
      console.error('할인 자격 확인 오류:', error);
      setIsEligible(false);
      setDiscountData(null);
    } finally {
      setLoading(false);
    }
  };

  return { isEligible, discountData, loading };
}