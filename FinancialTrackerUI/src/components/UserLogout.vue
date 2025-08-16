<template>
  <div>
    <button @click="logout" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Log out</button>
  </div>
</template>
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { logout } = useAuth0();

      return {
        logout: () => {
          logout({ logoutParams: { returnTo: window.location.origin } });
        }
      };
    }
  };
</script>
