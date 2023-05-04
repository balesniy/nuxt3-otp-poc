<template>
  <h1>Private page</h1>
  <p>Current user: {{ currentUser }}</p>
  <p>With token: {{ api.authToken }}</p>
</template>
<script setup>
import {useApi} from "~/composables/useApi";

definePageMeta({
  middleware: ['user-only'],
})
const currentUser = useAuthUser()
const api = useApi()
</script>
