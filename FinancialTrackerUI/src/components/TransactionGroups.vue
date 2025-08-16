<template>
  <div class="p-6 max-w-3xl mx-auto">
    <!-- Chart -->
    <div v-if="!loading" class="mb-6 bg-white p-4 rounded shadow">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else>
      <div
        v-for="group in sortedGroups"
        :key="group.label"
        class="border rounded-lg mb-4 overflow-hidden"
      >
        <!-- Group header -->
        <button
          @click="toggleGroup(group.label)"
          class="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200"
        >
          <span class="font-semibold">{{ group.label }}</span>
          <span
            class="text-sm"
            :class="group.total < 0 ? 'text-red-600' : 'text-green-600'"
          >
            Total: {{ formatCurrency(group.total) }}
          </span>
        </button>

        <!-- Transactions list -->
        <div v-if="expandedGroups.has(group.label)" class="bg-white">
          <ul>
            <li
              v-for="tx in group.transactions"
              :key="tx.id.timestamp + tx.description"
              class="px-4 py-2 border-t"
            >
              <div class="flex justify-between">
                <span>{{ tx.description }}</span>
                <span
                  :class="tx.amount < 0 ? 'text-red-500' : 'text-green-500'"
                >
                  {{ formatCurrency(tx.amount) }}
                </span>
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(tx.date) }} - {{ tx.bank }}
              </div>
            </li>
          </ul>
        </div>
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
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// ✅ Accept month as a prop ("YYYY-MM")
const props = defineProps({
  month: {
    type: String,
    required: true,
  },
});

const transactions = ref([]);
const loading = ref(true);
const expandedGroups = ref(new Set());

function toggleGroup(label) {
  if (expandedGroups.value.has(label)) {
    expandedGroups.value.delete(label);
  } else {
    expandedGroups.value.add(label);
  }
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

// Group transactions and split positives/negatives
const sortedGroups = computed(() => {
  const groups = {};

  transactions.value.forEach((tx) => {
    const isPositive = tx.amount >= 0;
    const groupKey = `${tx.clusterLabel} (${isPositive ? "Positive" : "Negative"})`;

    if (!groups[groupKey]) {
      groups[groupKey] = { label: groupKey, total: 0, transactions: [] };
    }
    groups[groupKey].transactions.push(tx);
    groups[groupKey].total += tx.amount;
  });

  return Object.values(groups).sort(
    (a, b) => Math.abs(b.total) - Math.abs(a.total)
  );
});

// Chart data comparing total positive vs negative
const chartData = computed(() => {
  let positiveTotal = 0;
  let negativeTotal = 0;

  transactions.value.forEach((tx) => {
    if (tx.amount >= 0) {
      positiveTotal += tx.amount;
    } else {
      negativeTotal += tx.amount;
    }
  });

  return {
    labels: ["Positive", "Negative"],
    datasets: [
      {
        label: "Total Amounts",
        backgroundColor: ["#16a34a", "#dc2626"],
        data: [positiveTotal, Math.abs(negativeTotal)],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: "Total Positive vs Negative Amounts",
    },
  },
};

// ✅ compute start/end dates from month string
function getMonthDateRange(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day of month
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

async function fetchTransactions() {
  loading.value = true;
  try {
    const { startDate, endDate } = getMonthDateRange(props.month);

    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc5bVd2dVU4MDhEUjVsOTNMdldnSiJ9.eyJpc3MiOiJodHRwczovL2Rldi1rMHNsMXhhYTFvODdvZmJuLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJDc05WUEFiTUVVY0U1VEI0bDRWMWQxa0dka2tqYUhOWkBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtazBzbDF4YWExbzg3b2Zibi51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTc1NTMwNjc0MSwiZXhwIjoxNzU1MzkzMTQxLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJDc05WUEFiTUVVY0U1VEI0bDRWMWQxa0dka2tqYUhOWiJ9.P7qwEmws-lq7EgNYsvKnXyhcaZfd8mOBrmKeSY72sVZ-ZwdIyMu7Vb_4bTgidyRYYvaRAPoHGSTPN4l66Shq0RYfQ7iQKh8KSYytElCVMWlgoOnfWpVTg-Y5l1e5DdEcxRtwu1j57ZCIW7t5Nuw_H2AxHblcpNtAhPyMutftZV_TTzYZeVTS-7mJ0NPgeWGaXGRAz1nCzbN6ZxRGauqEL3lJygnaZg_NsWpTray32RSZIg-tuSucEH4Pp02kNpdE7QDbxAPmQKJ8Z1oUGJnIuz3xK7LwPbHybhY34G5BnMmxCgdZritvP3hLisLQzuKHpoYqCly3KfuUsOsyVEVltQ"; // Replace or fetch dynamically
    const res = await fetch(
      `http://localhost:5005/VectorTransactions?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();
    transactions.value = json.data;
  } catch (err) {
    console.error("Failed to fetch transactions", err);
  } finally {
    loading.value = false;
  }
}

// fetch on mount + whenever prop changes
onMounted(fetchTransactions);
watch(() => props.month, fetchTransactions);
</script>
