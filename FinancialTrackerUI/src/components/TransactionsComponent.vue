<template>
  <div>
    <!-- Filter Inputs -->
    <div class="filters">
      <input v-model="filters.category" placeholder="Filter by category" />
      <input v-model="filters.vendor" placeholder="Filter by vendor" />
      <input v-model="filters.description" placeholder="Filter by description" />
      <button @click="showModal = true">+ Add Transaction</button>
    </div>

    <!-- Transaction List -->
    <TransactionComponent
      v-for="transaction in filteredTransactions"
      :key="transaction.id"
      :transItem="transaction"
    />

    <!-- Loading/Error States -->
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <!-- Add Transaction Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Add New Transaction</h2>
        <input v-model="newTransaction.category" placeholder="Category" />
        <input v-model="newTransaction.vendor" placeholder="Vendor" />
        <input v-model="newTransaction.description" placeholder="Description" />
        <input v-model.number="newTransaction.amount" placeholder="Amount" type="number" />
        <div class="modal-actions">
          <button @click="addTransaction">Add</button>
          <button @click="showModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import TransactionComponent from './TransactionComponent.vue';
import Api from '../services/Api';
import CacheService from '@/services/CacheService';

const transactions = ref([]);
const loading = ref(true);
const error = ref(null);
const api = new Api();

// Modal state
const showModal = ref(false);
const newTransaction = ref({
  category: '',
  vendor: '',
  description: '',
  amount: null
});

// Filters
const filters = ref({
  category: '',
  vendor: '',
  description: ''
});

const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    return (
      transaction.category.toLowerCase().includes(filters.value.category.toLowerCase()) &&
      transaction.vendor.toLowerCase().includes(filters.value.vendor.toLowerCase()) &&
      transaction.description.toLowerCase().includes(filters.value.description.toLowerCase())
    );
  });
});

const loadTransactions = async () => {
  loading.value = true;
  error.value = null;

  try {
    const cached = CacheService.get('cachedTransactions');
    if (cached) {
      transactions.value = cached;
      console.log('Loaded from cache');
    } else {
      const data = await api.GetFinancialTransactons();
      transactions.value = data;
      CacheService.set('cachedTransactions', data);
      console.log('Fetched from API and cached');
    }
  } catch (err) {
    error.value = 'Failed to fetch financial transactions.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const addTransaction = async () => {
  try {
    const created = await api.CreateTransaction(newTransaction.value);
    transactions.value.push(created);
    CacheService.set('cachedTransactions', transactions.value);
    showModal.value = false;
    newTransaction.value = {
      category: '',
      vendor: '',
      description: '',
      amount: null
    };
  } catch (err) {
    console.error('Failed to add transaction:', err);
    alert('Failed to add transaction. Please try again.');
  }
};

onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
.filters {
  margin-bottom: 1rem;
}
.filters input {
  margin-right: 0.5rem;
}
.filters button {
  padding: 0.3rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}
.modal input {
  display: block;
  margin-bottom: 1rem;
  width: 100%;
  padding: 0.5rem;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
}
</style>
