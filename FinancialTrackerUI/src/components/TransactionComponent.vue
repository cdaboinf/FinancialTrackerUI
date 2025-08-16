<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  transItem : Object
})

const dynamicClass = computed(() => {
  switch (props.transItem.category) {
    case "Subscription":
      return 'bg-blue-200 p-8 m-2';
    case "Personal":
      return 'bg-green-200 p-8 m-2';
    case "Mortgage":
      return 'bg-red-200 p-8 m-2';
    default:
      return 'bg-slate-200 p-8 m-2';
  }
});
</script>

<template>
  <div :class="dynamicClass">
    <p class="text-gray-600 mt-2">User ID: {{ props.transItem.userId}}</p>
    <p class="text-gray-600 mt-2">Date:{{ props.transItem.date }}</p>
    <p class="text-gray-600 mt-2">Category: {{ props.transItem.category }}</p>
    <p class="text-gray-600 mt-2">Amount: {{ props.transItem.currencyAmount }}</p>
    <p class="text-gray-600 mt-2">Vendor: {{ props.transItem.vendor }}</p>
    <p class="text-gray-600 mt-2">Description: {{ props.transItem.description }}</p>
  </div>
</template>
