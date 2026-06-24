<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  type ChartOptions,
} from 'chart.js'
import metricsJson from '@/data/metrics.json'
import MetricsOverview from '@/components/MetricsOverview.vue'
import FastForwardLogo from '@/components/FastForwardLogo.vue'
import type { MetricsData, MetricKey, SummaryMetric } from '@/types/metrics'
import {
  CHART_COLORS,
  aggregateValue,
  computeChange,
  formatChangeText,
  formatMetricValue,
  getMonthlyPair,
  getMonthMetricValue,
  getSentimentDirection,
} from '@/utils/metrics'
import { scatterEnterStyle } from '@/utils/animate'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
)

const metricsData = metricsJson as MetricsData
const months = metricsData.months

const selectedMonth = ref<string | null>(null)

const monthOptions = computed(() => [
  { label: 'All', value: null },
  ...months.map((m) => ({ label: m.label, value: m.month })),
])

const selectedIndex = computed(() => {
  if (selectedMonth.value === null) {
    return -1
  }
  return months.findIndex((m) => m.month === selectedMonth.value)
})

const labels = computed(() => months.map((m) => m.label))

const filteredMonths = computed(() => {
  if (selectedMonth.value === null) {
    return months
  }
  return months.filter((m) => m.month === selectedMonth.value)
})

function barColors(): string[] {
  return months.map((_, index) =>
    selectedIndex.value === -1 || index === selectedIndex.value
      ? CHART_COLORS.primary
      : CHART_COLORS.primaryMuted,
  )
}

function pointRadii(): number[] {
  return months.map((_, index) =>
    selectedIndex.value === -1 ? 3 : index === selectedIndex.value ? 6 : 3,
  )
}

function pointColors(): string[] {
  return months.map((_, index) =>
    selectedIndex.value === -1 || index === selectedIndex.value
      ? CHART_COLORS.primary
      : CHART_COLORS.primaryMuted,
  )
}

const shipmentVolumeChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Shipment Volume',
      data: months.map((m) => m.shipmentVolume),
      backgroundColor: barColors(),
      borderColor: months.map((_, index) =>
        selectedIndex.value === -1 || index === selectedIndex.value
          ? 'rgba(0, 242, 255, 0.6)'
          : 'rgba(0, 242, 255, 0.1)',
      ),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
}))

const onTimeChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'On-Time Delivery Rate',
      data: months.map((m) => m.onTimeDeliveryRate),
      borderColor: CHART_COLORS.primary,
      backgroundColor: CHART_COLORS.primaryFill,
      pointBackgroundColor: pointColors(),
      pointBorderColor: months.map((_, index) =>
        selectedIndex.value === -1 || index === selectedIndex.value
          ? '#0a0b0d'
          : 'rgba(10, 11, 13, 0.5)',
      ),
      pointBorderWidth: 2,
      pointRadius: pointRadii(),
      pointHoverRadius: 7,
      tension: 0.4,
      fill: false,
      borderWidth: 2,
    },
  ],
}))

const openExceptionsChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Open Exceptions',
      data: months.map((m) => m.openExceptions),
      borderColor: CHART_COLORS.primary,
      backgroundColor: CHART_COLORS.primaryFill,
      pointBackgroundColor: pointColors(),
      pointBorderColor: months.map((_, index) =>
        selectedIndex.value === -1 || index === selectedIndex.value
          ? '#0a0b0d'
          : 'rgba(10, 11, 13, 0.5)',
      ),
      pointBorderWidth: 2,
      pointRadius: pointRadii(),
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
      borderWidth: 2,
    },
  ],
}))

const regionalChartData = computed(() => {
  const periodMonths = filteredMonths.value
  const firstMonth = periodMonths[0]
  if (!firstMonth) {
    return { labels: [], datasets: [] }
  }

  const regionLabels = firstMonth.regions.map((r) => r.label)
  const regionRates = regionLabels.map((_, index) => {
    const total = periodMonths.reduce(
      (sum, month) => sum + (month.regions[index]?.onTimeDeliveryRate ?? 0),
      0,
    )
    return total / periodMonths.length
  })

  return {
    labels: regionLabels,
    datasets: [
      {
        label: 'On-Time Rate',
        data: regionRates,
        backgroundColor: regionLabels.map((_, index) =>
          `rgba(0, 242, 255, ${0.9 - index * 0.15})`,
        ),
        borderColor: 'rgba(0, 242, 255, 0.5)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }
})

const tooltipDefaults = {
  backgroundColor: 'rgba(14, 16, 18, 0.92)',
  borderColor: 'rgba(0, 242, 255, 0.25)',
  borderWidth: 1,
  padding: 12,
  titleColor: 'rgba(255, 255, 255, 0.55)',
  bodyColor: '#ffffff',
}

const shipmentVolumeChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipDefaults,
      callbacks: {
        label: (ctx) =>
          `Shipments: ${formatMetricValue('shipmentVolume', ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.tick },
      border: { display: false },
    },
    y: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.tick },
      border: { display: false },
    },
  },
}

const onTimeChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipDefaults,
      callbacks: {
        label: (ctx) =>
          `On-Time: ${formatMetricValue('onTimeDeliveryRate', ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.tick },
      border: { display: false },
    },
    y: {
      grid: { color: CHART_COLORS.grid },
      ticks: {
        color: CHART_COLORS.tick,
        callback: (value) => `${value}%`,
      },
      border: { display: false },
      min: 90,
      max: 100,
    },
  },
}

const openExceptionsChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipDefaults,
      callbacks: {
        label: (ctx) =>
          `Exceptions: ${formatMetricValue('openExceptions', ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.tick },
      border: { display: false },
    },
    y: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.tick },
      border: { display: false },
    },
  },
}

const regionalChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipDefaults,
      callbacks: {
        label: (ctx) =>
          `On-Time: ${formatMetricValue('onTimeDeliveryRate', ctx.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: CHART_COLORS.grid },
      ticks: { color: CHART_COLORS.tick },
      border: { display: false },
    },
    y: {
      grid: { color: CHART_COLORS.grid },
      ticks: {
        color: CHART_COLORS.tick,
        callback: (value) => `${value}%`,
      },
      border: { display: false },
      min: 90,
      max: 100,
    },
  },
}

const metricDefinitions: {
  key: MetricKey
  label: string
  icon: string
  higherIsBetter: boolean
}[] = [
  {
    key: 'shipmentVolume',
    label: 'Shipment Volume',
    icon: 'mdi-truck-fast-outline',
    higherIsBetter: true,
  },
  {
    key: 'onTimeDeliveryRate',
    label: 'On-Time Delivery',
    icon: 'mdi-clock-check-outline',
    higherIsBetter: true,
  },
  {
    key: 'regionalPerformance',
    label: 'Regional Performance',
    icon: 'mdi-earth',
    higherIsBetter: true,
  },
  {
    key: 'openExceptions',
    label: 'Open Exceptions',
    icon: 'mdi-alert-circle-outline',
    higherIsBetter: false,
  },
]

const periodLabel = computed(() => {
  if (selectedMonth.value === null) {
    return `Full year ${metricsData.year}`
  }
  const month = months.find((m) => m.month === selectedMonth.value)
  return month ? `${month.label} ${metricsData.year}` : `Full year ${metricsData.year}`
})

const summaryMetrics = computed<SummaryMetric[]>(() => {
  const { current, previous } = getMonthlyPair(months, selectedMonth.value)
  const isAll = selectedMonth.value === null

  return metricDefinitions.map(({ key, label, icon, higherIsBetter }) => {
    const displayValue = isAll ? aggregateValue(key, months) : getMonthMetricValue(current, key)
    const change =
      previous !== null
        ? computeChange(getMonthMetricValue(current, key), getMonthMetricValue(previous, key))
        : { percent: 0, direction: 'flat' as const }

    return {
      key,
      label,
      icon,
      value: formatMetricValue(key, displayValue),
      change,
      higherIsBetter,
    }
  })
})

function changeIcon(metric: SummaryMetric): string {
  const direction = getSentimentDirection(metric.change, metric.higherIsBetter)
  if (direction === 'up') return 'mdi-arrow-up'
  if (direction === 'down') return 'mdi-arrow-down'
  return 'mdi-minus'
}

function changePillClass(metric: SummaryMetric): string {
  const direction = getSentimentDirection(metric.change, metric.higherIsBetter)
  if (direction === 'up') return 'change-pill--up'
  if (direction === 'down') return 'change-pill--down'
  return 'change-pill--flat'
}
</script>

<template>
  <div class="dashboard-scene">
    <div class="dashboard-orb dashboard-orb--1" />
    <div class="dashboard-orb dashboard-orb--2" />

    <v-app-bar flat class="glass-app-bar" height="72">
      <div class="app-brand">
        <FastForwardLogo />
        <span class="dashboard-title">FastForward Logistics</span>
      </div>
      <v-spacer class="app-bar-spacer" />
      <v-select
        v-model="selectedMonth"
        :items="monthOptions"
        item-title="label"
        item-value="value"
        label="Month"
        density="compact"
        hide-details
        variant="outlined"
        class="month-picker glass-select"
        color="primary"
        :menu-props="{ contentClass: 'month-picker-menu', theme: 'light' }"
        :list-props="{ class: 'month-picker-list' }"
      />
    </v-app-bar>

    <v-main class="dashboard-main">
      <v-container class="py-8" fluid>
        <v-row>
          <v-col
            v-for="(metric, index) in summaryMetrics"
            :key="metric.key"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              flat
              class="glass-card metric-card dashboard-tile-enter"
              :style="scatterEnterStyle(index, 120)"
            >
              <v-card-text class="pa-5">
                <div class="d-flex align-center metric-label mb-4">
                  <v-icon :icon="metric.icon" size="small" color="primary" class="mr-2" />
                  {{ metric.label }}
                </div>
                <div class="metric-value mb-4">{{ metric.value }}</div>
                <div class="d-flex align-center flex-wrap ga-2">
                  <span class="change-pill" :class="changePillClass(metric)">
                    <v-icon :icon="changeIcon(metric)" size="x-small" />
                    {{ formatChangeText(metric.change) }}
                  </span>
                  <span class="change-hint">from previous month</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <div class="dashboard-tile-enter" :style="scatterEnterStyle(4, 120)">
              <MetricsOverview :metrics="summaryMetrics" :period-label="periodLabel" />
            </div>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card
              flat
              class="glass-card glass-card--chart chart-card dashboard-tile-enter"
              :style="scatterEnterStyle(5, 120)"
            >
              <v-card-title class="chart-title pa-5 pb-0">Shipment Volume</v-card-title>
              <v-card-text class="chart-container pa-5">
                <Bar :data="shipmentVolumeChartData" :options="shipmentVolumeChartOptions" />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card
              flat
              class="glass-card glass-card--chart chart-card dashboard-tile-enter"
              :style="scatterEnterStyle(6, 120)"
            >
              <v-card-title class="chart-title pa-5 pb-0">On-Time Delivery Rates</v-card-title>
              <v-card-text class="chart-container pa-5">
                <Line :data="onTimeChartData" :options="onTimeChartOptions" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card
              flat
              class="glass-card glass-card--chart chart-card dashboard-tile-enter"
              :style="scatterEnterStyle(7, 120)"
            >
              <v-card-title class="chart-title pa-5 pb-0">Regional Performance</v-card-title>
              <v-card-subtitle class="chart-subtitle px-5 pb-0">
                On-time delivery rate by region
              </v-card-subtitle>
              <v-card-text class="chart-container pa-5">
                <Bar :data="regionalChartData" :options="regionalChartOptions" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card
              flat
              class="glass-card glass-card--chart chart-card dashboard-tile-enter"
              :style="scatterEnterStyle(8, 120)"
            >
              <v-card-title class="chart-title pa-5 pb-0">Open Exceptions</v-card-title>
              <v-card-text class="chart-container pa-5">
                <Line :data="openExceptionsChartData" :options="openExceptionsChartOptions" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.month-picker {
  max-width: 168px;
  margin-right: 12px;
  flex-shrink: 0;
}

.metric-card,
.chart-card {
  height: 100%;
}

.chart-container {
  height: 280px;
}

.chart-subtitle {
  color: var(--dash-text-muted);
  font-size: 0.8125rem;
  opacity: 1;
}
</style>
