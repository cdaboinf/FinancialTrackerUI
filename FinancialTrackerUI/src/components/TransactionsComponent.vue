<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Loading -->
    <div v-if="loading" class="mb-4 text-center text-gray-500 font-medium">
      Loading transactions...
    </div>

    <div v-else>
      <!-- Graph type toggle -->
      <div class="flex justify-center space-x-6 mb-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="bar"
            v-model="chartMode"
            class="text-blue-600 focus:ring-blue-500"
          />
          <span class="text-gray-700">Bar Only</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="line"
            v-model="chartMode"
            class="text-blue-600 focus:ring-blue-500"
          />
          <span class="text-gray-700">Line Only</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            value="both"
            v-model="chartMode"
            class="text-blue-600 focus:ring-blue-500"
          />
          <span class="text-gray-700">Both</span>
        </label>
      </div>

      <!-- Mixed Chart -->
      <div
        v-if="chartData && chartData.labels"
        class="mb-8 bg-white p-4 rounded shadow"
      >
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <!-- Top 10 Lists -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Credits -->
        <div class="border rounded-lg overflow-hidden bg-green-50">
          <div class="p-4 bg-green-200 font-semibold text-center">Top 10 Credits</div>
          <ul>
            <li
              v-for="(tx, i) in uniqueTopCredits"
              :key="`credit-${i}`"
              class="px-6 py-2 border-t bg-green-100 hover:bg-green-200 flex justify-between items-center"
            >
              <span class="text-gray-700">{{ tx.description }}</span>
              <span class="font-semibold text-green-700">
                {{ tx.amount.toFixed(2) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Debits -->
        <div class="border rounded-lg overflow-hidden bg-red-50">
          <div class="p-4 bg-red-200 font-semibold text-center">Top 10 Debits</div>
          <ul>
            <li
              v-for="(tx, i) in uniqueTopDebits"
              :key="`debit-${i}`"
              class="px-6 py-2 border-t bg-red-100 hover:bg-red-200 flex justify-between items-center"
            >
              <span class="text-gray-700">{{ tx.description }}</span>
              <span class="font-semibold text-red-700">
                -{{ Math.abs(tx.amount).toFixed(2) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { Api } from "../services/Api"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from "chart.js"
import { Bar } from "vue-chartjs"

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
)

const { GetVectorTransactions } = Api()

const loading = ref(true)
const transactions = ref<any[]>([])
const currentYear = new Date().getFullYear()
const chartMode = ref<"bar" | "line" | "both">("both")

const fetchAllTransactions = async () => {
  loading.value = true
  transactions.value = []

  let pageNumber = 1
  const pageSize = 50
  let totalPages = 1

  while (pageNumber <= totalPages) {
    const response = await GetVectorTransactions(
      pageNumber,
      pageSize,
      `${currentYear}-01-01`,
      `${currentYear}-12-31`
    )

    if (response?.data) {
      transactions.value.push(...response.data)
    }

    totalPages = response?.totalPages || 1
    pageNumber++
  }

  loading.value = false
}

onMounted(fetchAllTransactions)

// Monthly totals
const monthlyTotals = computed(() => {
  const months = Array.from({ length: 12 }, () => ({ credit: 0, debit: 0 }))
  transactions.value.forEach(tx => {
    const date = new Date(tx.date)
    const month = date.getMonth()
    if (tx.amount > 0) months[month].credit += tx.amount
    else months[month].debit += Math.abs(tx.amount)
  })
  return months
})

// Chart data
const chartData = computed(() => {
  const labels = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ]

  const baseDatasets = [
    {
      type: "bar" as const,
      label: "Debit (Bar)",
      data: monthlyTotals.value.map(m => m.debit),
      backgroundColor: "rgba(239, 68, 68, 0.6)"
    },
    {
      type: "bar" as const,
      label: "Credit (Bar)",
      data: monthlyTotals.value.map(m => m.credit),
      backgroundColor: "rgba(34, 197, 94, 0.6)"
    },
    {
      type: "line" as const,
      label: "Debit (Line)",
      data: monthlyTotals.value.map(m => m.debit),
      borderColor: "rgba(239, 68, 68, 1)",
      backgroundColor: "rgba(239, 68, 68, 0.7)",
      tension: 0.3,
      borderWidth: 2,
      fill: false,
      yAxisID: "y"
    },
    {
      type: "line" as const,
      label: "Credit (Line)",
      data: monthlyTotals.value.map(m => m.credit),
      borderColor: "rgba(34, 197, 94, 1)",
      backgroundColor: "rgba(34, 197, 94, 0.7)",
      tension: 0.3,
      borderWidth: 2,
      fill: false,
      yAxisID: "y"
    }
  ]

  if (chartMode.value === "bar") {
    return { labels, datasets: baseDatasets.filter(d => d.type === "bar") }
  }
  if (chartMode.value === "line") {
    return { labels, datasets: baseDatasets.filter(d => d.type === "line") }
  }
  return { labels, datasets: baseDatasets } // both
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Monthly Debit vs Credit" }
  },
  scales: { y: { beginAtZero: true } }
}

// --- Top 10 credits/debits with unique amounts ---
const uniqueTopCredits = computed(() => {
  const seen = new Set<number>()
  return [...transactions.value]
    .filter(tx => tx.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .filter(tx => {
      if (seen.has(tx.amount)) return false
      seen.add(tx.amount)
      return true
    })
    .slice(0, 10)
})

const uniqueTopDebits = computed(() => {
  const seen = new Set<number>()
  return [...transactions.value]
    .filter(tx => tx.amount < 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .filter(tx => {
      const absAmt = Math.abs(tx.amount)
      if (seen.has(absAmt)) return false
      seen.add(absAmt)
      return true
    })
    .slice(0, 10)
})
</script>
