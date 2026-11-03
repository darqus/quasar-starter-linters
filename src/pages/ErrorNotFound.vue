<script setup lang="ts"></script>

<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="error-not-found__code">404</div>

      <div class="error-not-found__message text-h2">Oops. Nothing here...</div>

      <q-btn
        class="q-mt-xl"
        color="white"
        label="Go Home"
        text-color="blue"
        to="/"
        no-caps
        unelevated
      />
    </div>
  </div>
</template>
