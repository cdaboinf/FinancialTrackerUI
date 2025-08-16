<template>
  <div class="p-4">
    <p class="text-gray-600 mt-2">CSV Upload & Preview</p>

    <!-- Styled Upload Button -->
    <label
      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow cursor-pointer hover:bg-blue-700 transition"
    >
      <i class="pi pi-upload mr-2" />
      Upload CSV
      <input
        type="file"
        accept=".csv"
        @change="handleFileUpload"
        class="hidden"
      />
    </label>

    <div v-if="csvData.length" class="mt-6">
      <DataTable
        :value="csvData"
        scrollable
        scrollHeight="400px"
        class="mt-4"
      >
      <Column
        v-for="col in columns"
        :key="col"
        :field="col"
        :header="col">
      </Column>
      </DataTable>

    </div>
  </div>
</template>

<script setup>
  import Papa from 'papaparse';
  import { ref } from 'vue';

  const csvData = ref([]);
  const columns = ref([]);

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        csvData.value = results.data;
        columns.value = results.meta.fields || [];
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
      },
    });
  }
</script>

<style scoped>
input[type="file"] {
  margin-top: 1rem;
}
.highlighted-header {
    background-color: yellow;
}
</style>
