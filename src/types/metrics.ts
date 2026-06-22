export interface MonthMetrics {
  month: string
  label: string
  revenue: number
  visitors: number
  conversions: number
  orders: number
}

export interface MetricsData {
  year: number
  months: MonthMetrics[]
}

export type MetricKey = 'revenue' | 'visitors' | 'conversions' | 'orders'

export interface MetricChange {
  percent: number
  direction: 'up' | 'down' | 'flat'
}

export interface SummaryMetric {
  key: MetricKey
  label: string
  icon: string
  value: string
  change: MetricChange
}
