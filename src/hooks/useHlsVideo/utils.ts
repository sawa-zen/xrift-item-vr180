import { VideoTexture, SRGBColorSpace, LinearFilter } from 'three'
import { HlsJsPlayer } from './classes/HlsJsPlayer'
import { NativeHlsPlayer } from './classes/NativeHlsPlayer'
import type { HlsPlayerOptions, CreatePlayerResult, VideoTextureResult } from './types'

export function appendCacheKey(url: string, cacheKey: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}_ck=${cacheKey}`
}

export function canPlayHlsNatively(): boolean {
  if (typeof document === 'undefined') return false
  const video = document.createElement('video')
  return video.canPlayType('application/vnd.apple.mpegurl') !== ''
}

export function createVideoTexture(): VideoTextureResult {
  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.playsInline = true
  video.muted = true
  video.loop = true

  const texture = new VideoTexture(video)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter

  return { video, texture }
}

export async function createHlsPlayer(
  options: HlsPlayerOptions
): Promise<CreatePlayerResult> {
  try {
    const Hls = (await import('hls.js')).default
    if (Hls.isSupported()) {
      return {
        player: new HlsJsPlayer(Hls, options),
        type: 'hlsjs',
      }
    }
  } catch (err) {
    console.warn('[createHlsPlayer] Failed to load hls.js:', err)
  }

  if (canPlayHlsNatively()) {
    return {
      player: new NativeHlsPlayer(options),
      type: 'native',
    }
  }

  return {
    player: null,
    type: 'unsupported',
    error: new Error('HLS playback is not supported in this browser'),
  }
}
