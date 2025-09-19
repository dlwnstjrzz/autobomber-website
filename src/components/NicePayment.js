"use client";
import { useEffect, useRef } from 'react';

export default function NicePayment({ paymentData, onSuccess, onFailure }) {
  const scriptLoadedRef = useRef(false);
  const paymentStartedRef = useRef(false);

  useEffect(() => {
    if (!paymentData || paymentStartedRef.current) return;

    const loadSDKAndStartPayment = async () => {
      try {
        // 이미 SDK가 로드되어 있는지 확인
        if (window.AUTHNICE) {
          startPayment();
          return;
        }

        // SDK 로드
        if (!scriptLoadedRef.current) {
          await loadNicePaySDK();
          scriptLoadedRef.current = true;
        }

        // SDK 로드 후 결제 시작
        if (window.AUTHNICE) {
          startPayment();
        } else {
          throw new Error('나이스페이 SDK 로드 실패');
        }
      } catch (error) {
        console.error('결제 초기화 오류:', error);
        onFailure && onFailure('결제 초기화 중 오류가 발생했습니다.');
      }
    };

    loadSDKAndStartPayment();
  }, [paymentData]);

  const loadNicePaySDK = () => {
    return new Promise((resolve, reject) => {
      // 이미 로드된 스크립트가 있는지 확인
      const existingScript = document.querySelector('script[src*="pay.nicepay.co.kr"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = 'https://pay.nicepay.co.kr/v1/js/';
      script.async = false; // 동기적으로 로드

      script.onload = () => {
        console.log('나이스페이 SDK 로드 완료');
        // 잠시 대기 후 SDK 사용 가능 확인
        setTimeout(() => {
          if (window.AUTHNICE) {
            resolve();
          } else {
            reject(new Error('SDK 로드 후에도 AUTHNICE 객체를 찾을 수 없습니다'));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error('나이스페이 SDK 로드 실패'));
      };

      document.head.appendChild(script);
    });
  };

  const startPayment = () => {
    if (paymentStartedRef.current) return;
    paymentStartedRef.current = true;

    if (!window.AUTHNICE) {
      console.error('AUTHNICE 객체를 찾을 수 없습니다');
      onFailure && onFailure('결제 시스템 로드 오류');
      return;
    }

    try {
      console.log('결제 시작:', paymentData);

      window.AUTHNICE.requestPay({
        clientId: paymentData.clientId,
        method: paymentData.method,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        goodsName: paymentData.goodsName,
        buyerName: paymentData.buyerName,
        buyerTel: paymentData.buyerTel,
        buyerEmail: paymentData.buyerEmail,
        returnUrl: paymentData.returnUrl,
        mallReserved: paymentData.mallReserved,
        fnError: function(result) {
          console.error('결제 오류:', result);
          paymentStartedRef.current = false;
          onFailure && onFailure(result.errorMsg || '결제가 취소되었습니다.');
        }
      });
    } catch (error) {
      console.error('결제 요청 오류:', error);
      paymentStartedRef.current = false;
      onFailure && onFailure('결제 요청 중 오류가 발생했습니다.');
    }
  };

  return null;
}