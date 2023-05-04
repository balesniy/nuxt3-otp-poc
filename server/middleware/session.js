import {getSession} from '~~/server/utils/session'

const baseURL = 'https://searadar.com';
export default defineEventHandler(async (event) => {
  // const user = await getSession(event)
  const token = getCookie(event, 'session_token');
  if (!token) {
    return
  }
  try {
    const { data } = await $fetch('/api/auth/get-user-data', {
      baseURL,
      headers: {
        'X-Auth-Token': token,
      },
    })
    if (data?.user_data) {
      event.context.user = data.user_data
      event.context.session_token = token
    }

  } catch (e) {
    console.error('session error', e.status, e.data.message)
  }
})
