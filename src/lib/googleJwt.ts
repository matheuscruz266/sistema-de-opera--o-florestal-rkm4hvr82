// Utilitário para assinar JWT RS256 no browser usando Web Crypto API (nativo)
// Converte a chave privada PEM PKCS#8 da conta de serviço Google em CryptoKey e gera o JWT de asserção OAuth2

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleanPem = pem
    .replace(/-----BEGIN[A-Z0-9\s_-]+-----/g, '')
    .replace(/-----END[A-Z0-9\s_-]+-----/g, '')
    .replace(/\s+/g, '')

  const binaryString = atob(cleanPem)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Gera um JWT assinado RS256 para Google Service Account OAuth2
 * @param clientEmail E-mail da conta de serviço (ex.: x@proj.iam.gserviceaccount.com)
 * @param privateKeyPem Chave privada RSA PKCS#8 no formato PEM
 * @param scopes Escopos solicitados (ex.: 'https://www.googleapis.com/auth/spreadsheets.readonly')
 */
export async function createGoogleServiceAccountJwt(
  clientEmail: string,
  privateKeyPem: string,
  scopes = 'https://www.googleapis.com/auth/spreadsheets.readonly',
): Promise<string> {
  if (!clientEmail || !privateKeyPem) {
    throw new Error('client_email e private_key são obrigatórios.')
  }

  if (!window.isSecureContext || !window.crypto?.subtle) {
    throw new Error(
      'A autenticação do Google exige um contexto seguro. Acesse por HTTPS ou use http://localhost; endereços IP ou nomes de rede local via HTTP não oferecem essa API.',
    )
  }

  // 1. Importar chave privada PKCS#8 via Web Crypto API nativa
  const keyBuffer = pemToArrayBuffer(privateKeyPem)
  const cryptoKey = await window.crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign'],
  )

  // 2. Montar header e claims do JWT conforme especificação do Google OAuth2
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const payload = {
    iss: clientEmail,
    scope: scopes,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  // 3. Assinar com RSASSA-PKCS1-v1_5 SHA-256
  const enc = new TextEncoder()
  const signatureBuffer = await window.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    enc.encode(dataToSign),
  )

  const encodedSignature = arrayBufferToBase64Url(signatureBuffer)
  return `${dataToSign}.${encodedSignature}`
}
