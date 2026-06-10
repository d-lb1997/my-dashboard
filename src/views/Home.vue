<template>
  <v-container fluid>
    <v-app-bar dense color="primary" dark>
      <v-toolbar-title>My Dashboard</v-toolbar-title>
      <v-spacer />
      <v-select
        v-model="selected"
        :items="pickerItems"
        dense
        hide-details
        style="max-width: 160px"
        variant="outlined"
      />
    </v-app-bar>

    <v-container class="pa-6" fluid>
      <v-row>
        <v-col cols="12" md="3" v-for="card in summaryCards" :key="card.key">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2">{{ card.title }}</div>
                <div class="text-h6 font-weight-medium">{{ card.value }}</div>
              </div>
              <div class="text-right">
                <div :class="card.change >= 0 ? 'text-success' : 'text-error'">
                  <v-icon small>
                    {{ card.change >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                  </v-icon>
                  {{ Math.abs(card.change).toFixed(1) }}%
                </div>
                <div class="text-caption">vs prev</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6" align="stretch">
        <v-col cols="12" md="6">
          <v-card class="pa-4" elevation="2">
            <div class="text-subtitle-1 mb-2">Monthly Revenue</div>
            <canvas ref="revenueCanvas" style="height:320px"></canvas>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4" elevation="2">
            <div class="text-subtitle-1 mb-2">Visitors Over Time</div>
            <canvas ref="visitorsCanvas" style="height:320px"></canvas>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="pa-4" elevation="2">
            <div class="text-subtitle-1 mb-2">Conversions Trend</div>
            <canvas ref="conversionsCanvas" style="height:240px"></canvas>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import metrics from '../data/metrics.json'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

type Metric = {
  month: string
  label: string
  revenue: number
  visitors: number
  conversions: number
  orders: number
}

export default defineComponent({
  name: 'Home',
  setup() {
    const data = metrics as Metric[]

    const selected = ref<string>('All')

    const pickerItems = computed(() => ['All', ...data.map((m) => m.label)])

    const selectedIndex = computed(() => {
      if (selected.value === 'All') return -1
      return data.findIndex((d) => d.label === selected.value)
    })

    const filtered = computed(() => {
      if (selected.value === 'All') return data
      return [data[selectedIndex.value]] as Metric[]
    })

    // Summary cards
    const formatCurrency = (n: number) => `$${n.toLocaleString()}`

    function calcSummary() {
      const arr = filtered.value
      const totalRevenue = arr.reduce((s, x) => s + x.revenue, 0)
      const totalVisitors = arr.reduce((s, x) => s + x.visitors, 0)
      const avgConversion = arr.reduce((s, x) => s + x.conversions, 0) / arr.length
      const totalOrders = arr.reduce((s, x) => s + x.orders, 0)
      return {
        revenue: totalRevenue,
        visitors: totalVisitors,
        conversions: avgConversion,
        orders: totalOrders,
      }
    }

    const prevIndex = computed(() => (selectedIndex.value > 0 ? selectedIndex.value - 1 : selectedIndex.value === 0 ? null : data.length - 1))

    function pctChange(current: number, prev: number | null) {
      if (prev === null || prev === 0) return 0
      return ((current - prev) / prev) * 100
    }

    const summaryCards = computed(() => {
      const s = calcSummary()
      // determine previous values to compute change
      const prev = prevIndex.value !== null && prevIndex.value >= 0 ? data[prevIndex.value] : null

      const revenuePrev = prev ? prev.revenue : s.revenue
      const visitorsPrev = prev ? prev.visitors : s.visitors
      const conversionsPrev = prev ? prev.conversions : s.conversions
      const ordersPrev = prev ? prev.orders : s.orders

      return [
        {
          key: 'revenue',
          title: 'Revenue',
          value: formatCurrency(s.revenue),
          change: pctChange(s.revenue, revenuePrev),
        },
        {
          key: 'visitors',
          title: 'Visitors',
          value: s.visitors.toLocaleString(),
          change: pctChange(s.visitors, visitorsPrev),
        },
        {
          key: 'conversions',
          title: 'Conversions',
          value: `${s.conversions.toFixed(1)}%`,
          change: pctChange(s.conversions, conversionsPrev),
        },
        {
          key: 'orders',
          title: 'Orders',
          value: s.orders.toLocaleString(),
          change: pctChange(s.orders, ordersPrev),
        },
      ]
    })

    // Charts
    const revenueCanvas = ref<HTMLCanvasElement | null>(null)
    const visitorsCanvas = ref<HTMLCanvasElement | null>(null)
    const conversionsCanvas = ref<HTMLCanvasElement | null>(null)

    let revenueChart: Chart | null = null
    let visitorsChart: Chart | null = null
    let conversionsChart: Chart | null = null

    function buildRevenueChart() {
      if (!revenueCanvas.value) return
      const ctx = revenueCanvas.value.getContext('2d') as CanvasRenderingContext2D
      const labels = data.map((d) => d.label)
      const values = data.map((d) => d.revenue)
      const background = labels.map((l, i) => (selectedIndex.value === i ? 'rgba(76,175,80,0.9)' : 'rgba(54,162,235,0.6)'))

      if (revenueChart) revenueChart.destroy()
      revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: values,
              backgroundColor: background,
              borderColor: 'rgba(54,162,235,1)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                callback: function (val) {
                  return '$' + Number(val).toLocaleString()
                },
              },
            },
          },
        },
      })
    }

    function buildVisitorsChart() {
      if (!visitorsCanvas.value) return
      const ctx = visitorsCanvas.value.getContext('2d') as CanvasRenderingContext2D
      const labels = data.map((d) => d.label)
      const values = data.map((d) => d.visitors)

      if (visitorsChart) visitorsChart.destroy()
      visitorsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Visitors',
              data: values,
              borderColor: 'rgba(255,193,7,1)',
              backgroundColor: 'rgba(255,193,7,0.2)',
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    }

    function buildConversionsChart() {
      if (!conversionsCanvas.value) return
      const ctx = conversionsCanvas.value.getContext('2d') as CanvasRenderingContext2D
      const labels = data.map((d) => d.label)
      const values = data.map((d) => d.conversions)

      if (conversionsChart) conversionsChart.destroy()
      conversionsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Conversions (%)',
              data: values,
              borderColor: 'rgba(103,58,183,1)',
              backgroundColor: 'rgba(103,58,183,0.2)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                callback: function (val) {
                  return val + '%'
                },
              },
            },
          },
        },
      })
    }

    function rebuildCharts() {
      nextTick(() => {
        buildRevenueChart()
        buildVisitorsChart()
        buildConversionsChart()
      })
    }

    onMounted(() => {
      rebuildCharts()
    })

    watch(selected, () => {
      rebuildCharts()
    })

    onBeforeUnmount(() => {
      revenueChart?.destroy()
      visitorsChart?.destroy()
      conversionsChart?.destroy()
    })

    return {
      selected,
      pickerItems,
      summaryCards,
      revenueCanvas,
      visitorsCanvas,
      conversionsCanvas,
    }
  },
})
</script>

<style scoped>
.text-success { color: #4caf50; }
.text-error { color: #ff5252; }
</style>
