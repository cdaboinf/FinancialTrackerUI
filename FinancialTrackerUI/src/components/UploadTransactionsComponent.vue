<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
    </div>

    <!-- Upload Card -->
    <div
      class="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
    >
      <!-- Upload button -->
      <label
        class="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition"
      >
        <i class="pi pi-upload mr-2 text-lg" />
        Upload CSV
        <input
          type="file"
          accept=".csv"
          @change="handleFileUpload"
          class="hidden"
        />
      </label>

     <!-- Tags input (always visible) -->
<div class="mt-4">
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Tags (used to mark transactions as non-recurrent)
  </label>
  <div class="flex items-center gap-3">
    <input
      v-model="tags"
      type="text"
      placeholder="Enter tags (comma separated)"
      class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
    <button
      @click="handleSubmitTags"
      :disabled="!formattedTags.length || tagsLoading"
      class="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <span v-if="tagsLoading">Saving...</span>
      <span v-else>Save Tags</span>
    </button>
  </div>
  <p v-if="formattedTags.length" class="text-xs text-gray-500 mt-1">
    Tags: {{ formattedTags.join(', ') }}
  </p>
  <div
    v-if="tagsSuccessMessage"
    class="mt-2 p-2 rounded-lg bg-green-100 text-green-800 text-sm"
  >
    {{ tagsSuccessMessage }}
  </div>
</div>


      <!-- Form Section -->
      <div v-if="selectedFile" class="mt-8">
        <p class="text-gray-500 text-sm mb-3">
          Preview of uploaded data
        </p>

        <!-- Preview Table -->
        <div
          v-if="csvData.length"
          class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        >
          <DataTable
            :value="csvData"
            scrollable
            scrollHeight="400px"
            class="rounded-xl"
          >
            <Column
              v-for="col in columns"
              :key="col"
              :field="col"
              :header="col"
              headerClass="bg-gray-50 text-gray-700 font-medium"
            />
          </DataTable>
        </div>

        <!-- Input + Buttons -->
        <div class="mt-6 flex items-center justify-between">
          <input
            v-model="bank"
            type="text"
            placeholder="Enter bank name"
            class="flex-1 border border-gray-300 rounded-lg px-4 py-2 mr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <div class="flex gap-3">
            <button
              @click="handleBack"
              class="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              ← Back
            </button>
            <button
              @click="handleSubmitCsv"
              :disabled="!bank || !selectedFile || loading"
              class="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span v-if="loading">Uploading...</span>
              <span v-else>Submit CSV</span>
            </button>
          </div>
        </div>

        <!-- Success message -->
        <div
          v-if="successMessage"
          class="mt-4 p-3 rounded-lg bg-green-100 text-green-800 text-sm"
        >
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Papa from "papaparse";
import { ref, computed } from "vue";
import { Api } from '../services/Api';

// get methods from Api
const { UploadCsv, UploadTags } = Api();

const csvData = ref<any[]>([]);
const columns = ref<string[]>([]);
const bank = ref("");
const tags = ref("");
const selectedFile = ref<File | null>(null);
const loading = ref(false);
const successMessage = ref("");

// tags state
const tagsLoading = ref(false);
const tagsSuccessMessage = ref("");

// computed array of tags
const formattedTags = computed(() =>
  tags.value.split(",").map(t => t.trim()).filter(t => t)
);

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  selectedFile.value = file;
  successMessage.value = ""; // clear previous success message

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      csvData.value = results.data;
      columns.value = results.meta.fields || [];
    },
    error: (error) => {
      console.error("CSV Parse Error:", error);
    },
  });
}

async function handleSubmitCsv() {
  if (!bank.value || !selectedFile.value) return;

  loading.value = true;
  successMessage.value = ""; // clear old message

  try {
    const result = await UploadCsv(bank.value, selectedFile.value);
    console.log("Upload success:", result);
    successMessage.value = "✅ CSV uploaded successfully!";

    setTimeout(() => {
      successMessage.value = "";
    }, 5000);
  } catch (err) {
    console.error("Upload failed:", err);
    successMessage.value = "❌ Failed to upload CSV.";
  } finally {
    loading.value = false;
  }
}

async function handleSubmitTags() {
  if (!formattedTags.value.length) return;

  tagsLoading.value = true;
  tagsSuccessMessage.value = "";

  try {
    const result = await UploadTags(formattedTags.value);
    console.log("Tags saved:", result);
    tagsSuccessMessage.value = "✅ Tags saved successfully!";

    setTimeout(() => {
      tagsSuccessMessage.value = "";
    }, 5000);
  } catch (err) {
    console.error("Failed to save tags:", err);
    tagsSuccessMessage.value = "❌ Failed to save tags.";
  } finally {
    tagsLoading.value = false;
  }
}

function handleBack() {
  alert("Back clicked");
}
</script>
