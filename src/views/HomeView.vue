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
import type { MetricsData, MetricKey, SummaryMetric } from '@/types/metrics'
import {
  CHART_COLORS,
  aggregateValue,
  computeChange,
  formatChangeText,
  formatMetricValue,
  getMonthlyPair,
} from '@/utils/metrics'

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

const revenueChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Revenue',
      data: months.map((m) => m.revenue),
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

const visitorsChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Visitors',
      data: months.map((m) => m.visitors),
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

const conversionsChartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Conversions',
      data: months.map((m) => m.conversions),
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

const revenueChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(14, 16, 18, 0.92)',
      borderColor: 'rgba(0, 242, 255, 0.25)',
      borderWidth: 1,
      padding: 12,
      titleColor: 'rgba(255, 255, 255, 0.55)',
      bodyColor: '#ffffff',
      callbacks: {
        label: (ctx) =>
          `Revenue: ${formatMetricValue('revenue', ctx.parsed.y ?? 0)}`,
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
        callback: (value) =>
          formatMetricValue('revenue', Number(value)).replace('.00', ''),
      },
      border: { display: false },
    },
  },
}

const visitorsChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(14, 16, 18, 0.92)',
      borderColor: 'rgba(0, 242, 255, 0.25)',
      borderWidth: 1,
      padding: 12,
      titleColor: 'rgba(255, 255, 255, 0.55)',
      bodyColor: '#ffffff',
      callbacks: {
        label: (ctx) =>
          `Visitors: ${formatMetricValue('visitors', ctx.parsed.y ?? 0)}`,
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

const conversionsChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(14, 16, 18, 0.92)',
      borderColor: 'rgba(0, 242, 255, 0.25)',
      borderWidth: 1,
      padding: 12,
      titleColor: 'rgba(255, 255, 255, 0.55)',
      bodyColor: '#ffffff',
      callbacks: {
        label: (ctx) =>
          `Conversions: ${formatMetricValue('conversions', ctx.parsed.y ?? 0)}`,
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
    },
  },
}

const metricDefinitions: { key: MetricKey; label: string; icon: string }[] = [
  { key: 'revenue', label: 'Revenue', icon: 'mdi-currency-usd' },
  { key: 'visitors', label: 'Visitors', icon: 'mdi-account-group-outline' },
  { key: 'conversions', label: 'Conversions', icon: 'mdi-percent-outline' },
  { key: 'orders', label: 'Orders', icon: 'mdi-cart-outline' },
]

const summaryMetrics = computed<SummaryMetric[]>(() => {
  const { current, previous } = getMonthlyPair(months, selectedMonth.value)
  const isAll = selectedMonth.value === null

  return metricDefinitions.map(({ key, label, icon }) => {
    const displayValue = isAll ? aggregateValue(key, months) : current[key]
    const change =
      previous !== null
        ? computeChange(current[key], previous[key])
        : { percent: 0, direction: 'flat' as const }

    return {
      key,
      label,
      icon,
      value: formatMetricValue(key, displayValue),
      change,
    }
  })
})

function changeIcon(direction: SummaryMetric['change']['direction']): string {
  if (direction === 'up') return 'mdi-arrow-up'
  if (direction === 'down') return 'mdi-arrow-down'
  return 'mdi-minus'
}

function changePillClass(direction: SummaryMetric['change']['direction']): string {
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
      <v-app-bar-title class="dashboard-title">My Dashboard</v-app-bar-title>
      <v-spacer />
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
      />
    </v-app-bar>

    <v-main class="dashboard-main">
      <v-container class="py-8" fluid>
        <v-row>
          <v-col v-for="metric in summaryMetrics" :key="metric.key" cols="12" sm="6" md="3">
            <v-card flat class="glass-card metric-card">
              <v-card-text class="pa-5">
                <div class="d-flex align-center metric-label mb-4">
                  <v-icon :icon="metric.icon" size="small" color="primary" class="mr-2" />
                  {{ metric.label }}
                </div>
                <div class="metric-value mb-4">{{ metric.value }}</div>
                <div class="d-flex align-center flex-wrap ga-2">
                  <span class="change-pill" :class="changePillClass(metric.change.direction)">
                    <v-icon :icon="changeIcon(metric.change.direction)" size="x-small" />
                    {{ formatChangeText(metric.change) }}
                  </span>
                  <span class="change-hint">from previous month</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card flat class="glass-card glass-card--chart chart-card">
              <v-card-title class="chart-title pa-5 pb-0">Monthly Revenue</v-card-title>
              <v-card-text class="chart-container pa-5">
                <Bar :data="revenueChartData" :options="revenueChartOptions" />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card flat class="glass-card glass-card--chart chart-card">
              <v-card-title class="chart-title pa-5 pb-0">Visitors Over Time</v-card-title>
              <v-card-text class="chart-container pa-5">
                <Line :data="visitorsChartData" :options="visitorsChartOptions" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card flat class="glass-card glass-card--chart chart-card">
              <v-card-title class="chart-title pa-5 pb-0">Conversions Trend</v-card-title>
              <v-card-text class="chart-container pa-5">
                <Line :data="conversionsChartData" :options="conversionsChartOptions" />
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
  margin-right: 20px;
}

.metric-card,
.chart-card {
  height: 100%;
}

.chart-container {
  height: 280px;
}
</style>
