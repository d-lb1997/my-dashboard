const SCATTER_OFFSETS = [
  { x: -16, y: 24 },
  { x: 14, y: 26 },
  { x: -12, y: 20 },
  { x: 16, y: 22 },
  { x: -10, y: 28 },
  { x: 12, y: 24 },
  { x: -14, y: 22 },
  { x: 10, y: 26 },
  { x: -8, y: 24 },
]

const DEFAULT_OFFSET = { x: -12, y: 22 }

export function scatterEnterStyle(index: number, baseDelayMs = 0): Record<string, string> {
  const offset = SCATTER_OFFSETS[index % SCATTER_OFFSETS.length] ?? DEFAULT_OFFSET

  return {
    '--scatter-x': `${offset.x}px`,
    '--scatter-y': `${offset.y}px`,
    '--stagger-delay': `${baseDelayMs + index * 90}ms`,
  }
}
