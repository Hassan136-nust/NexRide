"use client"

import React, { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Video } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

export default function PartnerKycRoom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const userData = useSelector((state: RootState) => state.user.userData)

  useEffect(() => {
    if (!userData) {
      router.push("/")
      return
    }

    const initZego = async () => {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      )

      if (!containerRef.current) return

      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ""

      const roomID = String(userData._id)
      const userID = String(userData._id)
      const userName = userData.name || "Partner"

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomID,
        userID,
        userName
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: false,
        showPreJoinView: true,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        onLeaveRoom: () => router.push("/"),
      })
    }

    initZego()
  }, [userData, router])

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#080808] text-white flex-col relative">
      <header className="absolute top-0 left-0 w-full z-50 p-5">
        <button onClick={() => router.push("/")}>
          <ArrowLeft />
        </button>
        <h1>
          <Video /> Video KYC Interview
        </h1>
      </header>

      <div className="flex-1">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}