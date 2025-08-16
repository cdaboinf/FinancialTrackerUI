import { useAuth0 } from '@auth0/auth0-vue';

    export const authGuard = (to, from, next) => {
      const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

      const checkAuth = async () => {
        if (isLoading.value) {
          await new Promise(resolve => setTimeout(resolve, 50));
          return checkAuth();
        }

        if (!isAuthenticated.value) {
          loginWithRedirect({ appState: { targetUrl: to.fullPath } });
        } else {
          next();
        }
      };
      checkAuth();
    };
