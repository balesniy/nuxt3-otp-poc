<template>
  <header>
    <nav>
      <NuxtLink to="/">
        Home
      </NuxtLink>
      <NuxtLink v-if="currentUser" to="/private">
        Private
      </NuxtLink>
      <NuxtLink v-else to="/login">
        Login
      </NuxtLink>
    </nav>
  </header>
  <main>
    <slot />
  </main>
</template>

<script setup>
const currentUser = useAuthUser()
</script>
