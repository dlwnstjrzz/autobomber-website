import Image from "next/image";
import { FaApple, FaWindows } from "react-icons/fa";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-start justify-start bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-0 pb-8">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-10 left-40 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      {/* 상단 슬로건 이미지 */}
      <div className="relative z-10 text-center mb-2 w-full mt-8">
        <Image
          src="/image/slogan.svg"
          alt="자동화로 시간을 지배하라"
          width={800}
          height={120}
          className="w-180 md:w-200 mx-auto animate-pulse"
        />
      </div>

      {/* 메인 비디오 */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 mt-2">
        <video
          className="w-full h-auto rounded-2xl shadow-[0_0_100px_rgba(254,72,71,0.5)] border-2 border-primary/20 transition-all duration-500 hover:shadow-[0_0_120px_rgba(254,72,71,0.8)] hover:scale-[1.02]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video/heroVideo3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 다운로드 버튼들 */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-8 mt-12">
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Mac 다운로드 버튼 */}
          <button className="cursor-pointer flex-1 bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 text-white py-6 px-8 rounded-2xl font-bold text-lg transition-colors duration-300 flex items-center justify-center space-x-4 border-2 border-gray-700 hover:border-gray-600">
            <FaApple className="w-7 h-7 text-gray-300" />
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-400">Download for</span>
              <span className="text-xl font-black text-white">macOS</span>
            </div>
          </button>

          {/* Windows 다운로드 버튼 */}
          <button className="cursor-pointer flex-1 bg-gradient-to-r from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 text-white py-6 px-8 rounded-2xl font-bold text-lg transition-colors duration-300 flex items-center justify-center space-x-4 border-2 border-gray-600 hover:border-gray-500">
            <FaWindows className="w-7 h-7 text-gray-300" />
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-400">Download for</span>
              <span className="text-xl font-black text-white">Windows</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
