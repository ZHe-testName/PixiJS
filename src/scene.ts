import { Application, Graphics } from 'pixi.js'
import { Squere } from './graphics/square'
import { eventBus } from './events'
import { tweenDone, tweenValue, createTween } from './tween'
import { Pool } from './pool'
import { createFakeSocket, type ServerMessge } from './fakeSocket'

interface Bulet {
  view: Graphics
  speed: number
}

export async function createScene(host: HTMLElement): Promise<() => void> {
   const app = new Application()

  await app.init({
    background: '#1099bb',
    width: 1200,
    height: 800,
  })

  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      shutdown()
    }
  })

  host.appendChild(app.canvas)

  const eventBusEntity = eventBus()

  eventBusEntity.on('square:drag-start', () => {
    console.log('square:drag-start')
  })

  eventBusEntity.on('square:drag-end', () => {
    console.log('square:drag-end')
  })

  let runningStop = false

  const rect = new Squere(
    eventBusEntity,
    createTween,
    tweenValue,
    tweenDone,
  )

  app.stage.addChild(rect.view)

  const inbox: ServerMessge[] = []

  function socketBuletHandler(msg: ServerMessge): void {
    inbox.push(msg)
  }

  const killSocket = createFakeSocket(socketBuletHandler)

  function buletFactory(): Bulet {
    const buletBody = new Graphics()

    buletBody.rect(0, 0, 12, 8).fill('#3f3f3f')

    return {
      view: buletBody,
      speed: 0,
    }
  }

  function resetBulet(item: Bulet): void {
    item.view.x = 0
    item.view.y = 0
    item.speed = 0
  }

  const buletPool = new Pool<Bulet>(
    buletFactory,
    resetBulet,
  )

  const activeBulets: Bulet[] = []

  function shoot(speed: number, y: number): void {
    const bulet = buletPool.acquire()

    bulet.speed = speed // 4 + Math.random() * 10
    bulet.view.x = 0
    bulet.view.y = y // Math.random() * 800 + 100

    app.stage.addChild(bulet.view)
    activeBulets.push(bulet)
  }

  function buletFly(deltaTime: number): void {
    activeBulets.forEach((b) => b.view.x += b.speed * deltaTime)
  }

  function clearActiveBulet(): void {
    for (let i = activeBulets.length - 1; i >= 0; i--) {
      const bulet = activeBulets[i]

      if (bulet.view.x < 1000) continue

      app.stage.removeChild(bulet.view)
      buletPool.release(bulet)
      activeBulets.splice(i, 1)
    }
  }

  function processInbox(): void {
    while(inbox.length) {
      const msg = inbox.shift()

      if (!msg) break

      shoot(msg.speed, msg.y)
    }
  }

  function shutdown(): void {
    runningStop = true

    killSocket()

    activeBulets.forEach((b) => {
      app.stage.removeChild(b.view)
      b.view.destroy()
    })

    activeBulets.length = 0

    const pool = buletPool.drain()

    pool.forEach((b) => b.view.destroy())

    rect.destroy()

    app.destroy({ removeView: true })
  }

  app.ticker.add(
    (ticker) => {
      if (runningStop) return

      rect.update(ticker.deltaMS)

      processInbox()

      // shoot()
      buletFly(ticker.deltaTime)
      clearActiveBulet()
    }
  )

  return shutdown
}
