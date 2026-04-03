import { useEffect, useRef, useState } from 'react'
import { VideoTexture } from 'three'
import { appendCacheKey, createVideoTexture, createHlsPlayer } from './utils'
import { RecoveryTracker } from './classes/RecoveryTracker'
import type { HlsPlayerStrategy } from './types'

export interface UseHlsVideoOptions {
  url: string
  cacheKey?: number
  playing: boolean
  volume: number
  onError?: (error: Error) => void
  onBufferingChange?: (buffering: boolean) => void
}

export interface UseHlsVideoReturn {
  texture: VideoTexture
  videoRef: React.RefObject<HTMLVideoElement>
}

export function useHlsVideo({
  url,
  cacheKey = 0,
  playing,
  volume,
  onError,
  onBufferingChange,
}: UseHlsVideoOptions): UseHlsVideoReturn {
  const videoRef = useRef<HTMLVideoElement>(null!)
  const textureRef = useRef<VideoTexture | null>(null)
  const playerRef = useRef<HlsPlayerStrategy | null>(null)
  const recoveryTrackerRef = useRef(new RecoveryTracker())

  const [texture] = useState<VideoTexture>(() => {
    const { video, texture: tex } = createVideoTexture()
    videoRef.current = video
    textureRef.current = tex
    return tex
  })

  // プレイヤーの初期化
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const urlWithCacheKey = appendCacheKey(url, cacheKey)
    const tracker = recoveryTrackerRef.current
    tracker.reset()

    let player: HlsPlayerStrategy | null = null

    const init = async () => {
      const result = await createHlsPlayer({
        video,
        tracker,
        callbacks: {
          onError,
          onBufferingChange,
          onManifestParsed: () => {
            if (playing) {
              video.play().catch((err) =>
                console.error('[useHlsVideo] Play error after manifest parsed:', err)
              )
            }
          },
        },
      })

      if (result.type === 'unsupported') {
        onError?.(result.error)
        return
      }

      player = result.player
      playerRef.current = player
      player.load(urlWithCacheKey)
    }

    init()

    return () => {
      if (player) {
        player.destroy()
        playerRef.current = null
      }
      video.pause()
      video.src = ''
      video.load()
    }
  }, [url, cacheKey, onError, onBufferingChange, playing])

  // 再生/停止制御
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (playing) {
      video.muted = false
      video.play().catch((err) => console.error('[useHlsVideo] Play error:', err))
    } else {
      video.pause()
    }
  }, [playing])

  // バッファリング状態の監視
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleWaiting = () => onBufferingChange?.(true)
    const handlePlaying = () => onBufferingChange?.(false)
    const handleCanPlay = () => onBufferingChange?.(false)

    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [onBufferingChange])

  // 音量制御
  // - Quest/Android/デスクトップ: video.volume で段階的に制御
  // - iOS: video.volume は読み取り専用のため video.muted で mute/unmute のみ
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    try {
      video.volume = Math.max(0, Math.min(1, volume))
    } catch {
      // iOS では volume が読み取り専用のため無視
    }
    video.muted = volume === 0
  }, [volume])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose()
      }
    }
  }, [])

  return { texture, videoRef }
}
