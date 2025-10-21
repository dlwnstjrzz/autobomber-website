"use client";
import { useState, useEffect, createContext, useContext } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [kakaoUser, setKakaoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase 사용자 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      if (user) {
        // Firebase 사용자 정보를 쿠키에 저장
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        document.cookie = `firebase_user=${JSON.stringify(userData)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        setLoading(false);
      } else {
        // Firebase 사용자가 없으면 쿠키 삭제 후 카카오 사용자 확인
        document.cookie = 'firebase_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        checkKakaoUser();
      }
    });
    return () => unsubscribe();
  }, []);

  // 카카오 사용자 확인
  const checkKakaoUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      setKakaoUser(data.user);
    } catch (error) {
      console.error('카카오 사용자 확인 오류:', error);
      setKakaoUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Google 로그인 오류:", error);
      throw error;
    }
  };

  const signInWithKakao = (redirectTo) => {
    // 카카오 로그인 페이지로 이동 (이전 페이지 정보 전달)
    let kakaoUrl = '/api/auth/kakao';

    if (redirectTo && typeof redirectTo === 'string' && redirectTo.startsWith('/')) {
      kakaoUrl += `?redirect=${encodeURIComponent(redirectTo)}`;
    }

    window.location.href = kakaoUrl;
  };

  const logout = async () => {
    try {
      // Firebase 로그아웃
      if (firebaseUser) {
        await signOut(auth);
      }

      // 카카오 로그아웃
      if (kakaoUser) {
        await fetch('/api/auth/logout', { method: 'POST' });
        setKakaoUser(null);
      }

      // 모든 관련 쿠키 삭제
      const cookiesToDelete = [
        'firebase_user',
        'kakao_session',
        'trial_data'
      ];

      cookiesToDelete.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
      });

      // 상태 초기화
      setFirebaseUser(null);
      setKakaoUser(null);
    } catch (error) {
      console.error("로그아웃 오류:", error);
      throw error;
    }
  };

  const value = {
    user: firebaseUser || kakaoUser,
    loading,
    signInWithGoogle,
    signInWithKakao,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
