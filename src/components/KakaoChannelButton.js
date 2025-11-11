"use client";
import Image from "next/image";

const channelPublicId = "_sepkn";

export default function KakaoChannelButton() {
  const handleChat = () => {
    if (typeof window === "undefined") return;
    if (!window.Kakao || !window.Kakao.Channel) {
      console.warn("Kakao SDK not loaded yet");
      return;
    }

    try {
      window.Kakao.Channel.chat({
        channelPublicId,
      });
    } catch (error) {
      console.error("Failed to open Kakao chat", error);
    }
  };

  return (
    <button
      id="chat-channel-button"
      type="button"
      onClick={handleChat}
      className="cursor-pointer w-20 sm:w-25 bottom-5 right-5 fixed sm:bottom-10 sm:right-10 z-50 bg-transparent p-0 focus:outline-none"
      aria-label="카카오톡 채널 상담"
    >
      <Image
        src="/image/kakao_call.png"
        alt="카카오톡 채널 채팅 버튼"
        height={100}
        width={100}
      />
    </button>
  );
}
