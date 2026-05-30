'use client'

import React, { useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'

function Page() {
  const containerRef = useRef<HTMLDivElement>(null)

  const startCall = async () => {
    if (!containerRef.current) return

    try {
      const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ''

      const roomID = 'room-1'
      const userID = String(Date.now())
      const userName = 'Hassan'

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
        sharedLinks: [
          {
            name: 'Copy Link',
            url: `${window.location.origin}${window.location.pathname}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
        showPreJoinView: true,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
      })
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  return (
    <div className='w-full min-h-screen bg-black flex items-center justify-center'>
      <div
        ref={containerRef}
        className='w-full h-screen'
      />

      <button
        onClick={startCall}
        className='fixed bottom-10 right-10 px-6 py-3 bg-white text-black rounded-xl font-semibold'
      >
        Start Call
      </button>
    </div>
  )
}

export default Page