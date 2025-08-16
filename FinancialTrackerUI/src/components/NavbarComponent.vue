<template>
  <nav class="bg-gray-800 p-4 flex items-center justify-between">
    <!-- Centered links -->
    <ul class="flex-1 flex justify-center space-x-6">
      <li>
        <router-link to="/" class="text-white text-lg px-4 py-2 hover:bg-gray-700 rounded">Home</router-link>
      </li>
      <li>
        <router-link to="/transactions" class="text-white text-lg px-4 py-2 hover:bg-gray-700 rounded">Transactions</router-link>
      </li>
      <li>
        <router-link to="/accounts" class="text-white text-lg px-4 py-2 hover:bg-gray-700 rounded">Accounts</router-link>
      </li>
      <li>
        <router-link to="/banking" class="text-white text-lg px-4 py-2 hover:bg-gray-700 rounded">Banking</router-link>
      </li>
    </ul>

    <!-- Auth buttons on the right -->
    <div class="flex items-center space-x-2">
      <button
        v-if="!isAuthenticated"
        @click="loginWithRedirect"
        class="text-white text-sm hover:underline focus:outline-none"
      >
        Log in
      </button>

      <button
        v-else
        @click="handleLogout"
        class="text-white text-sm hover:underline focus:outline-none"
      >
        Log out
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import CacheService from '@/services/CacheService'

const { loginWithRedirect, logout, isAuthenticated } = useAuth0()

const handleLogout = () => {
  CacheService.remove('cachedTransactions')
  logout({ logoutParams: { returnTo: window.location.origin } })
}
</script>
