<template>
  <h1>Login</h1>
  <form @submit.prevent="sendCode">
    <label>
      Phone
      <input v-model="phone" type="tel" required>
    </label>
    <button type="button" @click="sendSMS">send code</button>
    <label>
      Code
      <input v-model="code" :disabled="!isSent" required inputmode="numeric">
    </label>
    <button :disabled="!isSent">verify code</button>
  </form>
</template>
<script setup>
import {useReCaptcha, VueReCaptcha} from 'vue-recaptcha-v3';
import {useApi} from "~/composables/useApi";

definePageMeta({
  middleware: ['guest-only'],
})
const currentUser = useAuthUser()
async function onLoginSuccess() {
  await navigateTo('/private')
}

const { vueApp } = useNuxtApp();
const token = ref('');
vueApp.use(VueReCaptcha, {
  siteKey: '6Le7kf0cAAAAACuQkMKB5-0BPyJzSm9actYeKn-E',
  loaderOptions: {
    autoHideBadge: true,
  },
});
onMounted(async () => {
  const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()
  await recaptchaLoaded();
  token.value = await executeRecaptcha('login');
})

const phone = ref('')
const code = ref('')
const isSent = ref(false)

const {getOTP, login} = useAuth()
const sendSMS = async () => {
  isSent.value = await getOTP(phone, token)
}

const sendCode = async () => {
  await login({ phone, code })
  await onLoginSuccess()
}

</script>
