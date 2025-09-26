import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

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
      <head>
        <script src="https://js.tosspayments.com/v2/standard"></script>
      </head>
      <body
        className={`${pretendard.variable} antialiased font-pretendard`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
