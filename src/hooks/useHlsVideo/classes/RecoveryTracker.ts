const RECOVERY_THROTTLE_MS = 5000
const MAX_RECOVERY_ATTEMPTS = 3

export class RecoveryTracker {
  private lastRecoveryTime = 0
  private recoveryAttempts = 0
  private errorReported = false

  reset(): void {
    this.lastRecoveryTime = 0
    this.recoveryAttempts = 0
    this.errorReported = false
  }

  get isErrorReported(): boolean {
    return this.errorReported
  }

  markErrorReported(): void {
    this.errorReported = true
  }

  shouldAttemptRecovery(): boolean {
    const now = Date.now()
    const timeSinceLastRecovery = now - this.lastRecoveryTime

    if (timeSinceLastRecovery < RECOVERY_THROTTLE_MS) {
      this.recoveryAttempts++
    } else {
      this.recoveryAttempts = 1
    }

    this.lastRecoveryTime = now

    if (this.recoveryAttempts > MAX_RECOVERY_ATTEMPTS) {
      console.error(
        `[RecoveryTracker] Recovery failed after ${MAX_RECOVERY_ATTEMPTS} attempts`
      )
      return false
    }

    return true
  }
}
