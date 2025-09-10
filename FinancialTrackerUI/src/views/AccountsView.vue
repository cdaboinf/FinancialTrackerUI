<script setup>
import UploadTransactionsComponent from '../components/UploadTransactionsComponent.vue'
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800">Bank Transactions Submission</h1>
    <p class="text-gray-600 mt-2">Submit bank transactions with a CSV file.</p>
  </div>
  <div class="p-1">
    <UploadTransactionsComponent />
  </div>
</template>

<style scoped>
</style>
