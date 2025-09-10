<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Loading -->
    <div v-if="loading" class="mb-4 text-center text-gray-500 font-medium">
      Loading...
    </div>

    <!-- Bar Chart (Credit vs Debit Totals) -->
    <div class="mb-6 bg-white p-4 rounded shadow">
      <Bar v-if="!loading" :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="!loading" class="grid grid-cols-2 gap-6">
      <!-- Credits -->
      <div class="border rounded-lg overflow-hidden bg-green-50">
        <div class="p-4 bg-green-200 font-semibold">Credits</div>
        <ul>
          <li
            v-for="group in groupedCredits"
            :key="group.cluster"
            class="border-t"
          >
            <!-- Subgroup -->
            <div v-if="group.txs.length > 1">
              <div
                class="px-6 py-2 cursor-pointer bg-green-100 hover:bg-green-200 text-green-900 flex justify-between items-center"
                @click="toggleCluster(group.cluster)"
              >
                <span>{{ group.cluster }}</span>
                <span>{{ formatCurrency(group.total) }}</span>
              </div>
              <ul v-if="expandedClusters.has(group.cluster)">
                <li
                  v-for="tx in group.txs"
                  :key="tx.id.timestamp + tx.description"
                  class="px-8 py-2 border-t cursor-pointer bg-green-100 hover:bg-green-200 text-green-900 text-sm"
                  @click.stop="toggleTransaction(tx.id.timestamp + tx.description)"
                >
                  <div class="flex justify-between">
                    <span>{{ tx.description }}</span>
                    <span class="text-green-600">{{ formatCurrency(tx.amount) }}</span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(tx.date) }} - {{ tx.bank }}
                  </div>
                  <div
                    v-if="expandedTransactions.has(tx.id.timestamp + tx.description)"
                    class="mt-2 text-sm text-gray-700 border-t pt-2 bg-green-100 rounded p-2"
                  >
                    <div><strong>Description:</strong> {{ tx.description }}</div>
                    <div><strong>ID:</strong> {{ tx.id.timestamp }}</div>
                    <div><strong>Cluster:</strong> {{ tx.clusterLabel }}</div>
                    <div><strong>Non-Recurrent:</strong> {{ tx.nonRecurrent }}</div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Single transaction -->
            <div v-else>
              <div
                class="px-6 py-2 cursor-pointer bg-green-100 hover:bg-green-200 text-green-900"
                @click="toggleTransaction(group.txs[0].id.timestamp + group.txs[0].description)"
              >
                <div class="flex justify-between">
                  <span class="font-medium">{{ group.cluster }}</span>
                  <span class="text-green-600">{{ formatCurrency(group.txs[0].amount) }}</span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(group.txs[0].date) }} - {{ group.txs[0].bank }}
                </div>
                <div
                  v-if="expandedTransactions.has(group.txs[0].id.timestamp + group.txs[0].description)"
                  class="mt-2 text-sm text-gray-700 border-t pt-2 bg-green-100 rounded p-2"
                >
                  <div><strong>Description:</strong> {{ group.txs[0].description }}</div>
                  <div><strong>ID:</strong> {{ group.txs[0].id.timestamp }}</div>
                  <div><strong>Cluster:</strong> {{ group.txs[0].clusterLabel }}</div>
                  <div><strong>Non-Recurrent:</strong> {{ group.txs[0].nonRecurrent }}</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Debits -->
      <div class="border rounded-lg overflow-hidden bg-red-50">
        <div class="p-4 bg-red-200 font-semibold">Debits</div>
        <ul>
          <li
            v-for="group in groupedDebits"
            :key="group.cluster"
            class="border-t"
          >
            <!-- Subgroup -->
            <div v-if="group.txs.length > 1">
              <div
                class="px-6 py-2 cursor-pointer bg-red-100 hover:bg-red-200 text-red-800 flex justify-between items-center"
                @click="toggleCluster(group.cluster)"
              >
                <span>{{ group.cluster }}</span>
                <span>{{ formatCurrency(group.total) }}</span>
              </div>
              <ul v-if="expandedClusters.has(group.cluster)">
                <li
                  v-for="tx in group.txs"
                  :key="tx.id.timestamp + tx.description"
                  class="px-8 py-2 border-t cursor-pointer bg-red-100 hover:bg-red-200 text-red-800 text-sm"
                  @click.stop="toggleTransaction(tx.id.timestamp + tx.description)"
                >
                  <div class="flex justify-between">
                    <span>{{ tx.description }}</span>
                    <span class="text-red-600">{{ formatCurrency(tx.amount) }}</span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(tx.date) }} - {{ tx.bank }}
                  </div>
                  <div
                    v-if="expandedTransactions.has(tx.id.timestamp + tx.description)"
                    class="mt-2 text-sm text-gray-700 border-t pt-2 bg-red-100 rounded p-2"
                  >
                    <div><strong>Description:</strong> {{ tx.description }}</div>
                    <div><strong>ID:</strong> {{ tx.id.timestamp }}</div>
                    <div><strong>Cluster:</strong> {{ tx.clusterLabel }}</div>
                    <div><strong>Non-Recurrent:</strong> {{ tx.nonRecurrent }}</div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Single transaction -->
            <div v-else>
              <div
                class="px-6 py-2 cursor-pointer bg-red-100 hover:bg-red-200 text-red-800"
                @click="toggleTransaction(group.txs[0].id.timestamp + group.txs[0].description)"
              >
                <div class="flex justify-between">
                  <span class="font-medium">{{ group.cluster }}</span>
                  <span class="text-red-600">{{ formatCurrency(group.txs[0].amount) }}</span>
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(group.txs[0].date) }} - {{ group.txs[0].bank }}
                </div>
                <div
                  v-if="expandedTransactions.has(group.txs[0].id.timestamp + group.txs[0].description)"
                  class="mt-2 text-sm text-gray-700 border-t pt-2 bg-red-100 rounded p-2"
                >
                  <div><strong>Description:</strong> {{ group.txs[0].description }}</div>
                  <div><strong>ID:</strong> {{ group.txs[0].id.timestamp }}</div>
                  <div><strong>Cluster:</strong> {{ group.txs[0].clusterLabel }}</div>
                  <div><strong>Non-Recurrent:</strong> {{ group.txs[0].nonRecurrent }}</div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Pie Chart for Debits -->
    <div v-if="!loading" class="mt-8 flex justify-center">
      <div class="w-[500px] h-[500px]">
        <Pie :data="debitChartData" :options="pieChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "vue-chartjs";
import { Api } from "../services/Api";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const props = defineProps({
  month: { type: String, required: true },
});

const transactions = ref([]);
const loading = ref(true);
const expandedTransactions = ref(new Set());
const expandedClusters = ref(new Set());
const api = new Api();

function toggleTransaction(uniqueId) {
  expandedTransactions.value.has(uniqueId)
    ? expandedTransactions.value.delete(uniqueId)
    : expandedTransactions.value.add(uniqueId);
}

function toggleCluster(cluster) {
  expandedClusters.value.has(cluster)
    ? expandedClusters.value.delete(cluster)
    : expandedClusters.value.add(cluster);
}

function formatCurrency(val) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function sumTransactions(txs) {
  return txs.reduce((sum, tx) => sum + tx.amount, 0);
}

const groupedCredits = computed(() => {
  const groups = {};
  transactions.value
    .filter((tx) => tx.amount >= 0)
    .forEach((tx) => {
      if (!groups[tx.clusterLabel]) groups[tx.clusterLabel] = [];
      groups[tx.clusterLabel].push(tx);
    });

  return Object.entries(groups)
    .map(([cluster, txs]) => ({
      cluster,
      txs,
      total: sumTransactions(txs),
    }))
    .sort((a, b) => b.total - a.total);
});

const groupedDebits = computed(() => {
  const groups = {};
  transactions.value
    .filter((tx) => tx.amount < 0 && !tx.nonRecurrent)
    .forEach((tx) => {
      if (!groups[tx.clusterLabel]) groups[tx.clusterLabel] = [];
      groups[tx.clusterLabel].push(tx);
    });

  return Object.entries(groups)
    .map(([cluster, txs]) => ({
      cluster,
      txs,
      total: sumTransactions(txs),
    }))
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
});

const chartData = computed(() => {
  let creditTotal = 0;
  let debitTotal = 0;
  transactions.value.forEach((tx) => {
    tx.amount >= 0 ? (creditTotal += tx.amount) : (debitTotal += tx.amount);
  });
  return {
    labels: ["Credit", "Debit"],
    datasets: [
      {
        label: "Total Amounts",
        backgroundColor: ["#16a34a", "#dc2626"],
        data: [creditTotal, Math.abs(debitTotal)],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Total Debit vs Credit Amounts" },
  },
};

const debitChartData = computed(() => {
  const labels = groupedDebits.value.map((g) => g.cluster);
  const data = groupedDebits.value.map((g) => Math.abs(g.total));

  const colors = [
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#6366f1", // indigo
    "#84cc16", // lime
    "#f97316", // orange
  ];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
      },
    ],
  };
});


const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "Debit Breakdown by Cluster" },
  },
};

function getMonthDateRange(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

async function fetchTransactions() {
  loading.value = true;
  try {
    const { startDate, endDate } = getMonthDateRange(props.month);
    const res = await api.GetVectorTransactions(1, 10000, startDate, endDate);
    transactions.value = res.data;
  } catch (err) {
    console.error("Failed to fetch transactions", err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchTransactions);
watch(() => props.month, fetchTransactions);
</script>
