"use client"

import { useEffect, useRef } from "react"

interface LiveSessionProps {
  roomId: string
  isHost?: boolean
  userName: string
}

export function LiveSession({ roomId, isHost = false, userName }: LiveSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamically load Jitsi script
    const script = document.createElement("script")
    script.src = "https://meet.jit.si/external_api.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.JitsiMeetExternalAPI && containerRef.current) {
        const domain = "meet.jit.si"
        const options = {
          roomName: roomId,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          userInfo: {
            displayName: userName
          },
          configOverwrite: {
            startWithAudioMuted: !isHost,
            startWithVideoMuted: !isHost,
            prejoinPageEnabled: false
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat',
              'settings', 'raisehand', 'videoquality', 'filmstrip',
              'tileview', 'help'
            ],
          }
        }
        
        const api = new window.JitsiMeetExternalAPI(domain, options)
        
        return () => {
          api.dispose()
        }
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [roomId, isHost, userName])

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative" ref={containerRef}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-white/50 text-sm animate-pulse">Đang kết nối phòng học trực tiếp...</p>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}
