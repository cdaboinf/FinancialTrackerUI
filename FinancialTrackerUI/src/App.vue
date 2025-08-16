<template>
  <div>
    <!-- Navbar Component -->
    <NavbarComponent />

    <!-- Router View to load different pages -->
    <div class="container mx-auto mt-6">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import NavbarComponent from "./components/NavbarComponent.vue";

export default {
  name: "App",
  components: {
    NavbarComponent
  }
};
</script>

<style>
/* Global styles (optional) */
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}
</style>
