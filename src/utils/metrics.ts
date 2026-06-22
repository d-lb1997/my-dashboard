import type { MetricChange, MetricKey, MonthMetrics } from '@/types/metrics'

export const CHART_COLORS = {
  primary: '#00f2ff',
  primaryMuted: 'rgba(0, 242, 255, 0.18)',
  primaryFill: 'rgba(0, 242, 255, 0.14)',
  grid: 'rgba(255, 255, 255, 0.04)',
  tick: 'rgba(255, 255, 255, 0.42)',
} as const

export function computeChange(current: number, previous: number): MetricChange {
  if (previous === 0) {
    return { percent: 0, direction: 'flat' }
  }
  const percent = ((current - previous) / previous) * 100
  if (Math.abs(percent) < 0.05) {
    return { percent: 0, direction: 'flat' }
  }
  return {
    percent,
    direction: percent > 0 ? 'up' : 'down',
  }
}

function getPreviousMonth(months: MonthMetrics[], index: number): MonthMetrics | null {
  if (index <= 0) {
    return null
  }
  return months[index - 1] ?? null
}

export function getMonthlyPair(
  months: MonthMetrics[],
  selectedMonth: string | null,
): { current: MonthMetrics; previous: MonthMetrics | null } {
  const lastIndex = months.length - 1
  const fallbackCurrent = months[lastIndex]!

  if (selectedMonth === null) {
    return {
      current: fallbackCurrent,
      previous: getPreviousMonth(months, lastIndex),
    }
  }

  const index = months.findIndex((m) => m.month === selectedMonth)
  if (index === -1) {
    return {
      current: fallbackCurrent,
      previous: getPreviousMonth(months, lastIndex),
    }
  }

  return {
    current: months[index]!,
    previous: getPreviousMonth(months, index),
  }
}

export function aggregateValue(key: MetricKey, months: MonthMetrics[]): number {
  if (key === 'conversions') {
    return months.reduce((sum, m) => sum + m.conversions, 0) / months.length
  }
  return months.reduce((sum, m) => sum + m[key], 0)
}

export function formatMetricValue(key: MetricKey, value: number): string {
  switch (key) {
    case 'revenue':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value)
    case 'conversions':
      return `${value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('en-US').format(Math.round(value))
  }
}

export function formatChangeText(change: MetricChange): string {
  if (change.direction === 'flat') {
    return 'No change'
  }
  const sign = change.direction === 'up' ? '+' : ''
  return `${sign}${change.percent.toFixed(1)}%`
}
