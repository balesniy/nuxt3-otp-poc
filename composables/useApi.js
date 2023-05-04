export const useApi = () => {
  const authToken = useState('authToken', () => null)
  return {
    async post(url, body) {
      const { data } = await useFetch(url, {
        method: 'post',
        body,
      })
      return unref(data)
    },
    async get(url) {
      try {
        const { data } = await useFetch(url, {
          // onRequest({ request, options }) {
          //   options.headers = options.headers || {}
          //   options.headers['X-Auth-Token'] = authToken.value
          // },
          headers: {
            'X-Auth-Token': authToken.value
          }
        })
        return unref(data)
      } catch (e) {
        console.log('catch', e)
      }

    },
    setToken(token) {
      authToken.value = token
    },
    authToken
  }
}
