import type Hls from 'hls.js'
import type { HlsPlayerStrategy, HlsPlayerOptions } from '../types'

export class HlsJsPlayer implements HlsPlayerStrategy {
  private hls: Hls
  private tracker: HlsPlayerOptions['tracker']

  constructor(HlsClass: typeof Hls, options: HlsPlayerOptions) {
    const { video, tracker, callbacks } = options
    this.tracker = tracker

    this.hls = new HlsClass({
      enableWorker: true,
      lowLatencyMode: true,
    })

    const { onError, onBufferingChange, onManifestParsed } = callbacks

    this.hls.on(HlsClass.Events.ERROR, (_event, data) => {
      if (!data.fatal) return

      if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
        const recovered = this.attemptRecovery()
        if (!recovered && !this.tracker.isErrorReported) {
          this.tracker.markErrorReported()
          onError?.(new Error(`HLS media error: ${data.details}`))
        }
      } else if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
        if (!this.tracker.isErrorReported) {
          this.tracker.markErrorReported()
          onError?.(new Error(`HLS network error: ${data.details}`))
        }
      } else {
        if (!this.tracker.isErrorReported) {
          this.tracker.markErrorReported()
          onError?.(new Error(`HLS error: ${data.type} - ${data.details}`))
        }
      }
    })

    this.hls.on(HlsClass.Events.FRAG_BUFFERED, () => {
      onBufferingChange?.(false)
    })

    this.hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
      onManifestParsed?.()
    })

    this.hls.attachMedia(video)
  }

  load(url: string): void {
    this.hls.loadSource(url)
  }

  destroy(): void {
    this.hls.destroy()
  }

  attemptRecovery(): boolean {
    if (!this.tracker.shouldAttemptRecovery()) return false
    try {
      this.hls.recoverMediaError()
      return true
    } catch {
      return false
    }
  }
}
