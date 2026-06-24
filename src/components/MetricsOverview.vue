<script setup lang="ts">
import { computed } from 'vue'
import type { SummaryMetric } from '@/types/metrics'
import { formatChangeText } from '@/utils/metrics'

const props = defineProps<{
  metrics: SummaryMetric[]
  periodLabel: string
}>()

const trendSummary = computed(() => {
  const up = props.metrics.filter((m) => m.change.direction === 'up').length
  const down = props.metrics.filter((m) => m.change.direction === 'down').length
  const flat = props.metrics.filter((m) => m.change.direction === 'flat').length

  if (down === 0 && flat === 0) {
    return 'All metrics trending up'
  }
  if (up === 0 && flat === 0) {
    return 'All metrics trending down'
  }

  const parts: string[] = []
  if (up > 0) parts.push(`${up} up`)
  if (down > 0) parts.push(`${down} down`)
  if (flat > 0) parts.push(`${flat} flat`)

  return parts.join(' · ')
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
  <v-card flat class="glass-card metrics-overview">
    <v-card-text class="pa-5 pa-md-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
        <div>
          <div class="metric-label mb-1">Performance Overview</div>
          <div class="overview-title">{{ periodLabel }}</div>
        </div>

        <div class="d-flex align-center flex-wrap ga-2">
          <v-chip
            size="small"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-chart-timeline-variant"
            class="overview-chip"
          >
            {{ trendSummary }}
          </v-chip>
          <v-chip size="small" variant="tonal" color="primary" class="overview-chip">
            {{ metrics.length }} metrics
          </v-chip>
        </div>
      </div>

      <v-divider class="overview-divider mb-5" />

      <v-row class="overview-grid" dense>
        <v-col v-for="metric in metrics" :key="metric.key" cols="12" sm="6" md="3">
          <div class="overview-item">
            <div class="d-flex align-center metric-label mb-2">
              <v-icon :icon="metric.icon" size="small" color="primary" class="mr-2" />
              {{ metric.label }}
            </div>
            <div class="overview-value">{{ metric.value }}</div>
            <div class="d-flex align-center flex-wrap ga-2 mt-3">
              <span class="change-pill" :class="changePillClass(metric.change.direction)">
                <v-icon :icon="changeIcon(metric.change.direction)" size="x-small" />
                {{ formatChangeText(metric.change) }}
              </span>
              <span class="change-hint">vs prev. month</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.metrics-overview {
  position: relative;
}

.metrics-overview::after {
  content: '';
  position: absolute;
  top: 0;
  left: 12%;
  width: 45%;
  height: 55%;
  background: radial-gradient(circle, rgba(0, 242, 255, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.overview-title {
  color: var(--dash-text);
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.overview-chip {
  font-size: 0.75rem;
}

.overview-divider {
  border-color: var(--dash-glass-border) !important;
  opacity: 1;
}

.overview-item {
  padding: 12px 0;
}

@media (min-width: 960px) {
  .overview-item {
    padding: 8px 12px;
    border-right: 1px solid var(--dash-glass-border);
  }

  .overview-grid > .v-col:last-child .overview-item {
    border-right: none;
  }
}

.overview-value {
  color: var(--dash-text);
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
</style>
