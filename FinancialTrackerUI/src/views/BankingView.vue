<script setup>
import TransactionGroups from '../components/TransactionGroups.vue'
import { ref } from "vue";

// Generate last 12 months dynamically
const months = [];
const now = new Date();

for (let i = 0; i < 12; i++) {
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

  const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  const label = d.toLocaleString("default", { month: "long", year: "numeric" });  // "August 2025"

  months.push({ value, label });
}

// Default to current month
const selectedMonth = ref(months[0].value);
</script>

<template>
   <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800">Transactions</h1>
    <p class="text-gray-600 dark">View monthly detail credits and debits per month.</p>
  </div>

  <!-- Dropdown -->
  <div class="mb-6 flex items-center space-x-4 p-6">
    <label class="text-gray-700 font-medium">Select Month:</label>
    <select
      v-model="selectedMonth"
      class="px-4 py-2 border rounded shadow-sm focus:ring focus:ring-blue-300"
    >
      <option v-for="m in months" :key="m.value" :value="m.value">
        {{ m.label }}
      </option>
    </select>
  </div>

    <!-- Centered Component -->
  <div class="flex justify-center items-center min-h-screen">
    <div class="w-full max-w-4xl">
      <TransactionGroups :month="selectedMonth" />
    </div>
  </div>
</template>
