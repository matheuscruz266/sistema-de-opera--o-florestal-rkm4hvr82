import forge from 'node-forge'

export function signGoogleServiceAccountJwt(clientEmail, privateKeyPem) {
  if (!clientEmail || !privateKeyPem) {
    throw new Error('Google service account email and private key are required.')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${header}.${encodedPayload}`
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
  const digest = forge.md.sha256.create()
  digest.update(unsignedToken, 'utf8')
  const signature = base64UrlEncodeBinary(privateKey.sign(digest))

  return `${unsignedToken}.${signature}`
}

function base64UrlEncode(value) {
  return base64UrlEncodeBinary(forge.util.encodeUtf8(value))
}

function base64UrlEncodeBinary(value) {
  return forge.util.encode64(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
