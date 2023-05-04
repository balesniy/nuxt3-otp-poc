// import cookieSignature from 'cookie-signature'
export async function getSession(event) {
  const config = useRuntimeConfig()

  const cookie = getCookie(event, config.cookieName)

  if (!cookie) return null

  const unsignedSession = cookieSignature.unsign(cookie, config.cookieSecret)

  if (!unsignedSession) return null

  const session = deserialize(unsignedSession)

  return getUserById(session.userId)
}

export function serialize(obj) {
  const value = Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64')
  const length = Buffer.byteLength(value)

  if (length > 4096)
    throw new Error('Session value is too long')

  return value
}

export function deserialize(value) {
  return JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
}
