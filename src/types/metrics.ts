export interface RegionMetrics {
  label: string
  shipmentVolume: number
  onTimeDeliveryRate: number
}

export interface MonthMetrics {
  month: string
  label: string
  shipmentVolume: number
  onTimeDeliveryRate: number
  openExceptions: number
  regions: RegionMetrics[]
}

export interface MetricsData {
  year: number
  months: MonthMetrics[]
}

export type MetricKey =
  | 'shipmentVolume'
  | 'onTimeDeliveryRate'
  | 'regionalPerformance'
  | 'openExceptions'

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
  higherIsBetter: boolean
}
