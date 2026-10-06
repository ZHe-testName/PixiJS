type Handler = () => void

export type EventBus = ReturnType<typeof eventBus>

export function eventBus() {
  const handlers = new Map<string, Handler[]>()

  return {
    on: (event: string, handler: Handler) => {
      const list = handlers.get(event) || []

      list.push(handler)
      handlers.set(event, list)

      return () => {
        const current = handlers.get(event)

        if (!current) return

        handlers.set(
          event,
          current.filter((item) => item !== handler)
        )
      }
    },
    emit: (event: string) => {
      handlers.get(event)?.forEach((handler) => handler())
    } 
  }
}