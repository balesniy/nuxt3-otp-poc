export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const response = await $fetch('https://searadar.com/api/auth/fast-auth', {
    method: 'post',
    body
  }).catch((error) => error.data)
  return {
    api: 'works',
    response
  }
})
