"use client"

import React, { useRef, useEffect, useState } from "react"
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

      // Fetch latest user record to get admin-assigned room id if available
      let latestUser = userData
      try {
        const res = await fetch("/api/auth/user/me")
        if (res.ok) {
          const jd = await res.json()
          if (jd?.user) latestUser = jd.user
        }
      } catch (err) {
        console.error("Failed to refresh user before joining KYC:", err)
      }

      const roomID = String(latestUser.videoKycRoomId || latestUser._id)
      const userID = String(latestUser._id)
      const userName = latestUser.name || "Partner"

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

    // Try to get a server-assigned room id; if not present, poll until admin starts session
    const tryJoin = async () => {
      // initial attempt will be inside initZego which refreshes once
      await initZego()

      // If partner still doesn't have an assigned room id (admin hasn't started), poll every 3s
      const checkRoom = async () => {
        try {
          const res = await fetch("/api/auth/user/me")
          if (!res.ok) return false
          const jd = await res.json()
          const latest = jd?.user
          if (latest?.videoKycRoomId) {
            // reload the page to re-run init and join the correct room
            window.location.reload()
            return true
          }
        } catch (err) {
          console.error("Error polling for KYC room:", err)
        }
        return false
      }

      let intervalId: any = null
      intervalId = setInterval(async () => {
        const found = await checkRoom()
        if (found && intervalId) clearInterval(intervalId)
      }, 3000)
    }

    tryJoin()
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