<template>
  <div>
    <button @click="login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Log in</button>
  </div>
</template>
<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithRedirect } = useAuth0();

      return {
        login: () => {
          loginWithRedirect();
        }
      };
    }
  };
</script>
