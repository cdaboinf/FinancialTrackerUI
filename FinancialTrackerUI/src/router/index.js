import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './auth_guard';
import Home from '@/views/HomeView.vue';
import Transactions from '@/views/TransactionsView.vue';
import Accounts from '@/views/AccountsView.vue';
import Banking from '@/views/BankingView.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/trends', component: Transactions, beforeEnter: authGuard },
  { path: '/submission', component: Accounts, beforeEnter: authGuard },
  { path: '/transactions', component: Banking, beforeEnter: authGuard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
