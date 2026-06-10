<template>
  <div style="height: 320px;">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default defineComponent({
  name: 'SampleChart',
  setup() {
    const canvas = ref<HTMLCanvasElement | null>(null)
    onMounted(() => {
      if (!canvas.value) return
      const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [
            {
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      })
    })
    return { canvas }
  },
})
</script>
