import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import KakaoChannelButton from "@/components/KakaoChannelButton";

const kakaoJavascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
const kakaoSdkVersion = "2.7.9";
const kakaoSdkIntegrity = process.env.NEXT_PUBLIC_KAKAO_SDK_INTEGRITY;

const pretendard = localFont({
  src: "../../static/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata = {
  title: "자동화 폭격기",
  description: "자동화로 시간을 지배하라",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      {/* Google tag (gtag.js) */}
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-61M8Y4ZSNE"
          strategy="afterInteractive"
          async
        />
        <Script
          src={`https://t1.kakaocdn.net/kakao_js_sdk/${kakaoSdkVersion}/kakao.min.js`}
          integrity={kakaoSdkIntegrity || undefined}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-61M8Y4ZSNE');
          `}
        </Script>
        {Boolean(kakaoJavascriptKey) && (
          <Script id="kakao-sdk-init" strategy="afterInteractive">
            {`
              if (window.Kakao) {
                if (!window.Kakao.isInitialized()) {
                  window.Kakao.init(${JSON.stringify(kakaoJavascriptKey)});
                }
                console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
              }
            `}
          </Script>
        )}
      </head>
      <body
        className={`${pretendard.variable} antialiased font-pretendard`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <Suspense
                fallback={
                  <div className="h-16 border-b border-border bg-background" />
                }
              >
                <Header />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <KakaoChannelButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
