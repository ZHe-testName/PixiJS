export interface Tween {
  from: number
  to: number
  duration: number
  elapsed: number
}

export type CreateTween = typeof createTween
export type TweenValue = typeof tweenValue
export type TweenDone = typeof tweenDone

export function createTween (from: number, to: number, duration: number): Tween {
  return {
    from,
    to,
    duration,
    elapsed: 0,
  }
}

export function tweenValue (tween: Tween, deltaMs: number): number {
  tween.elapsed += deltaMs

  const progress = Math.min(1, tween.elapsed / tween.duration)

  return tween.from + (tween.to - tween.from) * progress
}

export function tweenDone (tween: Tween): boolean {
  return tween.elapsed >= tween.duration
}
