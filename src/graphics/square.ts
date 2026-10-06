import { Graphics, type FederatedPointerEvent, BlurFilter } from 'pixi.js'
import { type EventBus } from '../events'
import { type Tween, type CreateTween, type TweenDone, type TweenValue } from '../tween'
import { createWaveFilter } from '../waveFilter'

type SquareState = 'idle' | 'dragging'

export class Squere {
  readonly view = new Graphics()

  private state: SquareState = 'idle'
  private offsetX: number = 0
  private offsetY: number = 0
  private eventBus: EventBus
  private tween: Tween
  private tweenValue: TweenValue
  private tweenDone:  TweenDone
  private createTween: CreateTween
  // private blur = new BlurFilter({ strength: 0 })
  private wave = createWaveFilter()
  private trevelTime: number = 0

  constructor(
    eventBus: EventBus,
    createTween: CreateTween,
    tweenValue: TweenValue,
    tweenDone: TweenDone
  ) {
    this.view.rect(0, 0, 60, 60).fill('#1123bb')
    this.view.eventMode = 'static'
    this.view.cursor = 'pointer'
    this.view.filters = [this.wave]

    this.view.on('pointerdown', this.onDraginStart, this)
    this.view.on('pointerup', this.onDraginEnd, this)
    this.view.on('pointerupoutside', this.onDraginEnd, this)
    this.view.on('globalpointermove', this.onDragMove, this)

    this.eventBus = eventBus

    this.tweenValue = tweenValue
    this.tweenDone = tweenDone
    this.createTween = createTween

    this.tween = {
      from: 0,
      to: 500,
      duration: 5000,
      elapsed: 0,
    }
  }

  private onDraginStart(event: FederatedPointerEvent): void {
    this.eventBus.emit('square:drag-start')
    this.state = 'dragging'

    this.view.cursor = 'grab'

    const point = this.view.parent!.toLocal(event.global)

    this.offsetX = this.view.x - point.x
    this.offsetY = this.view.y - point.y
  }

  private onDragMove(event: FederatedPointerEvent): void {
    if (this.state === 'idle') return

    const point = this.view!.parent!.toLocal(event.global)

    this.view.x = point.x + this.offsetX
    this.view.y = point.y + this.offsetY
  }

  private onDraginEnd(): void {
    this.eventBus.emit('square:drag-end')

    this.state = 'idle'

    this.view.cursor = 'pointer'
  }

  destroy(): void {
    this.wave.destroy()
    this.view.destroy()
  }

  update(deltaMs: number): void {
    this.trevelTime += deltaMs
    this.wave.resources.timeUniforms.uniforms.uTime = this.trevelTime / 300
    
    if (this.state === 'dragging') return

    this.view.x = this.tweenValue(this.tween, deltaMs)
    // this.blur.strength = (Math.sin(this.trevelTime / 300) + 1) * 4

    if (this.tweenDone(this.tween)) {
      this.tween = this.createTween(this.tween.to, this.tween.from, this.tween.duration)
    }
  }
}
