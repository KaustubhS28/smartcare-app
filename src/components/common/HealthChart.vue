<template>
  <div class="health-chart">
    <Bar v-if="type === 'bar'" :data="chartData" :options="options" />
    <Line v-else :data="chartData" :options="options" />
  </div>
</template>

<script setup>
import { Bar, Line } from 'vue-chartjs'
import { computed } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  type: {
    type: String,
    default: 'line',
  },
  chartData: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({ responsive: true, plugins: { legend: { position: 'top' } } }),
  },
})
</script>

<style scoped>
.health-chart {
  max-width: 600px;
  margin: 0 auto;
}
</style>
