import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectParam = searchParams.get("redirect");
  const stateParam = searchParams.get("state");

  const sanitizeRedirect = (value) => {
    if (!value || typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed.startsWith("/")) {
      return null;
    }

    return trimmed;
  };

  const getRedirectDestination = () => {
    let decodedState = null;

    if (stateParam) {
      try {
        decodedState = decodeURIComponent(stateParam);
      } catch (error) {
        decodedState = stateParam;
      }
    }

    return (
      sanitizeRedirect(decodedState) || sanitizeRedirect(redirectParam) || "/"
    );
  };

  // 1단계: 인가 코드가 없으면 카카오 로그인 페이지로 리다이렉트
  if (!code) {
    const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    const authURL = new URL("https://kauth.kakao.com/oauth/authorize");
    authURL.searchParams.set("client_id", REST_API_KEY);
    authURL.searchParams.set("redirect_uri", REDIRECT_URI);
    authURL.searchParams.set("response_type", "code");
    authURL.searchParams.set("scope", "profile_nickname,profile_image");
    const redirectTarget = sanitizeRedirect(redirectParam);

    if (redirectTarget) {
      authURL.searchParams.set("state", encodeURIComponent(redirectTarget));
    }

    console.log("카카오 인증 URL:", authURL.toString());

    return NextResponse.redirect(authURL.toString());
  }

  // 2단계: 토큰 받기
  try {
    console.log("토큰 요청 시작, 코드:", code);

    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
        code: code,
      }),
    });

    console.log("토큰 응답 상태:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("토큰 요청 실패:", errorText);
      throw new Error(`토큰 요청 실패: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("토큰 데이터:", tokenData);

    // 3단계: 사용자 정보 가져오기
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    console.log("사용자 정보 응답 상태:", userResponse.status);

    if (!userResponse.ok) {
      const userErrorText = await userResponse.text();
      console.error("사용자 정보 요청 실패:", userErrorText);
      throw new Error(`사용자 정보 요청 실패: ${userErrorText}`);
    }

    const userData = await userResponse.json();
    console.log("사용자 데이터 전체:", JSON.stringify(userData, null, 2));

    // 4단계: 사용자 정보를 세션에 저장하고 리다이렉트
    const redirectDestination = getRedirectDestination();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(
      /\/+$/,
      ""
    );
    const response = NextResponse.redirect(`${siteUrl}${redirectDestination}`);

    // 세션 쿠키에 사용자 정보 저장
    const userInfo = {
      id: userData.id,
      nickname: userData.properties?.nickname || "",
      profile_image: userData.properties?.profile_image || "",
      displayName: userData.properties?.nickname || "",
      photoURL: userData.properties?.profile_image || "",
    };

    console.log("저장할 사용자 정보:", userInfo);

    response.cookies.set("kakao_session", JSON.stringify(userInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("카카오 로그인 오류:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=login_failed`
    );
  }
}
