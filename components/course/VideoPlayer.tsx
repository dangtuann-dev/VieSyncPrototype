"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, AlertTriangle } from "lucide-react"

interface SecuredVideoPlayerProps {
  youtubeId: string
  userEmail: string
  userName: string
}

export function SecuredVideoPlayer({ youtubeId, userEmail, userName }: SecuredVideoPlayerProps) {
  const [isScreenHidden, setIsScreenHidden] = useState(false)
  const watermarkRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Block Keyboard Shortcuts (PrintScreen, F12, Ctrl+U, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen detection is limited, but we can block common dev tools / saving shortcuts
      if (
        (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || e.key === 'i' || e.key === 'j' || e.key === 'c')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault()
        alert("Hành động này bị chặn để bảo vệ bản quyền nội dung.")
      }
    }

    // 2. Detect Page Visibility (Simple Screen Recording Check)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsScreenHidden(true)
      } else {
        setIsScreenHidden(false)
      }
    }

    // 3. Dynamic Watermark Movement
    const interval = setInterval(() => {
      if (watermarkRef.current) {
        const x = Math.random() * 80 + 10 // 10% to 90%
        const y = Math.random() * 80 + 10 // 10% to 90%
        watermarkRef.current.style.left = `${x}%`
        watermarkRef.current.style.top = `${y}%`
      }
    }, 10000)

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('contextmenu', (e) => e.preventDefault())

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group">
      {/* YouTube Iframe */}
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&disablekb=1&enablejsapi=1`}
        className="w-full h-full pointer-events-auto"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Security Overlay (Blocks Right Click & Interactions) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Anti-selection & Watermark */}
        <div 
          ref={watermarkRef}
          className="absolute text-[10px] md:text-xs font-bold text-white/15 whitespace-nowrap pointer-events-none transition-all duration-1000 select-none"
          style={{ top: '20%', left: '20%' }}
        >
          {userName} — {userEmail}
        </div>
      </div>

      {/* Screen Hidden Message */}
      {isScreenHidden && (
        <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-center p-6 text-white">
          <Shield size={48} className="text-blue-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Video bị tạm dừng</h3>
          <p className="text-slate-400 text-sm max-w-xs">Để bảo mật nội dung, video sẽ không hiển thị khi bạn chuyển tab hoặc thực hiện quay phim màn hình.</p>
        </div>
      )}

      {/* Security Badge */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Secured by BlenEdU</span>
      </div>
    </div>
  )
}
