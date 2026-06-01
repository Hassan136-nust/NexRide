'use client'
import { useEffect } from 'react'
import { getSocket } from '@/lib/socket'

type Props = {
  userId?: string
}

function GeoUpdater({ userId }: Props) {
  useEffect(() => {
    if (!userId) return

    const socket = getSocket()

    const emitIdentity = () => {
      socket.emit('identity', { userId })
    }

    if (socket.connected) {
      emitIdentity()
    } else {
      socket.on('connect', emitIdentity)
    }

    return () => {
      socket.off('connect', emitIdentity)
    }

    const watcher = navigator.geolocation.watchPosition(()=>{
      socketRef.currect.emit()
    })

  }, [userId])

  return null
}

export default GeoUpdater
