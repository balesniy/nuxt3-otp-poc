import { useAuthUser } from './useAuthUser'

export const useAuth = () => {
  const authUser = useAuthUser()
  const api = useApi()

  const setUser = (user) => {
    authUser.value = user
  }

  const setCookie = (cookie) => {
    cookie.value = cookie
  }

  const getOTP = async (phone, token) => {
    const {status} = await api.post('/api/auth/verify-phone-captcha', {
      phone,
      token,
    });
    return status
  }

  const getUser = async () => {
    const { data: userData } = await api.get('/api/auth/get-user-data')
    setUser(userData?.user_data) // todo
  }

  const login = async ({phone, code}) => {
    const { data } = await api.post('/api/auth/fast-auth', {
      phone,
      verification_code: code
    })
    // todo set token to headers
    api.setToken(data.token)
    await getUser()

    // const config = useRuntimeConfig()
    // console.log({config})

    const authCookie = useCookie('session_token', { expires: new Date(Date.now() + 7*24*60*60*1000) })
    authCookie.value = data.token

    return data
  }

  const logout = async () => {
    const data = await $fetch('/auth/logout', {
      method: 'POST',
    })

    setUser(null)
  }

  const me = async () => {
    if (!authUser.value) {
      try {
        const data = await $fetch('/auth/me', {
          headers: useRequestHeaders(['cookie']),
        })

        setUser(data.user)
      }
      catch (error) {
        setCookie(null) // fixme
      }
    }

    return authUser
  }

  return {
    login,
    logout,
    me,
    getOTP,
    getUser
  }
}
