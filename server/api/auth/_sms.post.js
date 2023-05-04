export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {status} = await $fetch('https://searadar.com/api/auth/verify-phone-captcha', {
    method: 'post',
    body
  })
  return {
    api: 'works',
    status
  }
})
