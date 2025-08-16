import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './auth_guard';
import Home from '@/views/HomeView.vue';
import Transactions from '@/views/TransactionsView.vue';
import Accounts from '@/views/AccountsView.vue';
import Banking from '@/views/BankingView.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/transactions', component: Transactions },
  { path: '/accounts', component: Accounts, beforeEnter: authGuard },
  { path: '/banking', component: Banking, beforeEnter: authGuard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
