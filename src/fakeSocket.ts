export interface ServerMessge {
  type: 'bulet:spawn',
  y: number,
  speed: number,
}

export function createFakeSocket(
  onMessage: (msg: ServerMessge) => void
): () => void {
  const timer = window.setInterval(() => {
    onMessage({
      type: 'bulet:spawn',
      y: Math.random() * 800 + 100,
      speed: 4 + Math.random() * 10,
    })
  }, 300)

  return () => clearInterval(timer)
}