import type { HlsPlayerStrategy, HlsPlayerOptions } from '../types'

const MEDIA_ERR_DECODE = 3

export class NativeHlsPlayer implements HlsPlayerStrategy {
  private video: HTMLVideoElement
  private tracker: HlsPlayerOptions['tracker']
  private callbacks: HlsPlayerOptions['callbacks']
  private handleError: () => void

  constructor(options: HlsPlayerOptions) {
    this.video = options.video
    this.tracker = options.tracker
    this.callbacks = options.callbacks

    this.handleError = this.onError.bind(this)
    this.video.addEventListener('error', this.handleError)
  }

  private onError(): void {
    const error = this.video.error
    if (!error) return

    if (error.code === MEDIA_ERR_DECODE) {
      if (this.attemptRecovery()) return
    }

    if (!this.tracker.isErrorReported) {
      this.tracker.markErrorReported()
      this.callbacks.onError?.(new Error(error.message))
    }
  }

  load(url: string): void {
    this.video.src = url
  }

  destroy(): void {
    this.video.removeEventListener('error', this.handleError)
  }

  attemptRecovery(): boolean {
    if (!this.tracker.shouldAttemptRecovery()) return false
    this.video.currentTime = this.video.currentTime + 0.5
    this.video.play().catch(() => {})
    return true
  }
}
