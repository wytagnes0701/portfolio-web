const AES_KEY = import.meta.env.VITE_AES_KEY || 'F6C547DAEB7EEB88B51FC22C718315D4'

function toBytes(value: string) {
  return new TextEncoder().encode(value)
}

function fromBase64(value: string) {
  const cleaned = value.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')
  const padded = cleaned.padEnd(Math.ceil(cleaned.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function normalizePlainText(value: string) {
  return value.replaceAll(String.fromCharCode(0), '').trim()
}

export async function decryptAesCbc(cipherText: string, keyUtf8 = AES_KEY): Promise<string> {
  const keyBytes = toBytes(keyUtf8.trim())
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['decrypt'],
  )
  const iv = new Uint8Array(16)
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    fromBase64(cipherText),
  )
  return normalizePlainText(new TextDecoder().decode(plain))
}
