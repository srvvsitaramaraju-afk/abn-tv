<template>
  <div class="container py-5 my-5">
    <div class="row justify-content-center">
      <div class="col-lg-6 text-center">
        <!-- 404 Icon -->
        <div class="mb-4">
          <i class="bi bi-exclamation-triangle-fill display-1 text-danger"></i>
        </div>
        
        <!-- Title -->
        <h1 class="display-1 fw-bold  mb-3">404</h1>
        <h2 class="h2 fw-normal text-muted mb-4">Oops! Page Not Found</h2>
        
        <!-- Description -->
        <div class="lead  mb-5">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </div>
        
        <!-- Buttons -->
        <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <router-link 
            to="/" 
            class="btn btn-tv btn-lg px-4"
          >
            <i class="bi bi-house-door me-2"></i>
            Go Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.container {
  min-height: 60vh;
}

.display-1 {
  font-size: clamp(3rem, 8vw, 6rem);
}
</style>
