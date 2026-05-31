'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { ArrowLeft, Video } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export default function PartnerKycRoom() {
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const userData = useSelector((state: RootState) => state.user.userData)

    useEffect(() => {
        if (!userData) {
            router.push('/')
        }
    }, [userData, router])



    useEffect(() => {
        if (!containerRef.current || !userData) return

        const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ''

        // The partner's exact object _id is the room ID. The admin will connect here.
        const roomID = String(userData._id)
        const userID = String(userData._id)
        const userName = userData.name || 'Partner'

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
            onLeaveRoom: () => {
                router.push('/')
            }
        })

        return () => {
            zp.destroy()
        }
    }, [userData, router])

    if (!userData) {
        return (
            <div className='flex items-center justify-center h-screen bg-black'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                    <p className='text-xs text-gray-500'>Initializing secured room...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex h-screen bg-[#080808] text-white flex-col relative'>
            <header className='absolute top-0 left-0 w-full z-50 p-5 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <button onClick={() => router.push('/')} className='pointer-events-auto w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 backdrop-blur-md transition'>
                        <ArrowLeft size={18} />
                    </button>
                    <div className='flex flex-col'>
                        <h1 className='font-bold flex items-center gap-2 drop-shadow-md'><Video size={16} className='text-blue-400' /> Video KYC Interview</h1>
                        <p className='text-xs text-gray-300 drop-shadow-md'>Please wait for the NexRide Admin to join.</p>
                    </div>
                </div>
            </header>

            <div className='flex-1 relative'>
                <div ref={containerRef} className='w-full h-full' />
            </div>
        </div>
    )
}
