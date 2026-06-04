"use client"

import React, { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Video } from "lucide-react"
import { useSelector } from "react-redux"

import { RootState } from "@/redux/store"

export default function PartnerKycRoom() {
  const containerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const userData = useSelector(
    (state: RootState) => state.user.userData
  )

  useEffect(() => {
    if (!userData) {
      router.push("/")
      return
    }

    let intervalId: NodeJS.Timeout | null = null

    const initZego = async () => {
      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      )

      if (!containerRef.current) return

      const appId = Number(
        process.env.NEXT_PUBLIC_ZEGO_APP_ID
      )

      const serverSecret =
        process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ""

      // Refresh latest user data
      let latestUser = userData

      try {
        const res = await fetch("/api/auth/user/me")

        if (res.ok) {
          const jd = await res.json()

          if (jd?.user) {
            latestUser = jd.user
          }
        }
      } catch (err) {
        console.error(
          "Failed to refresh user before joining KYC:",
          err
        )
      }

      const roomID = String(
        latestUser.videoKycRoomId || latestUser._id
      )

      const userID = String(latestUser._id)

      const userName = latestUser.name || "Partner"

      const kitToken =
        ZegoUIKitPrebuilt.generateKitTokenForTest(
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

        onLeaveRoom: () => {
          router.push("/")
        },
      })
    }

    const tryJoin = async () => {
      await initZego()

      const checkRoom = async () => {
        try {
          const res = await fetch("/api/auth/user/me")

          if (!res.ok) return false

          const jd = await res.json()

          const latest = jd?.user

          if (latest?.videoKycRoomId) {
            window.location.reload()
            return true
          }
        } catch (err) {
          console.error(
            "Error polling for KYC room:",
            err
          )
        }

        return false
      }

      intervalId = setInterval(async () => {
        const found = await checkRoom()

        if (found && intervalId) {
          clearInterval(intervalId)
        }
      }, 3000)
    }

    tryJoin()

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
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
      <header className="absolute top-0 left-0 w-full z-50 p-5 flex items-center gap-4">
        <button onClick={() => router.push("/")}>
          <ArrowLeft />
        </button>

        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Video className="w-5 h-5" />
          Video KYC Interview
        </h1>
      </header>

      <div className="flex-1">
        <div
          ref={containerRef}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}