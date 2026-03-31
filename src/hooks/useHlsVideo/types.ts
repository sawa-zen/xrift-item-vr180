import type { RecoveryTracker } from './classes/RecoveryTracker'

export interface HlsPlayerCallbacks {
  onError?: (error: Error) => void
  onBufferingChange?: (buffering: boolean) => void
  onManifestParsed?: () => void
}

export interface HlsPlayerOptions {
  video: HTMLVideoElement
  tracker: RecoveryTracker
  callbacks: HlsPlayerCallbacks
}

/** HLS プレイヤーの共通インターフェース */
export interface HlsPlayerStrategy {
  load(url: string): void
  destroy(): void
  attemptRecovery(): boolean
}

export interface VideoTextureResult {
  video: HTMLVideoElement
  texture: import('three').VideoTexture
}

export type CreatePlayerResult =
  | { player: HlsPlayerStrategy; type: 'hlsjs' | 'native' }
  | { player: null; type: 'unsupported'; error: Error }
