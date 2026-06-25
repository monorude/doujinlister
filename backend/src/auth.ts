interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cache: TokenCache | null = null;

export async function getAccessToken(env: { GOOGLE_SERVICE_ACCOUNT_JSON: string }): Promise<string> {
  if (cache && Date.now() < cache.expiresAt - 60_000) {
    return cache.token;
  }
  const key: ServiceAccountKey = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const token = await fetchToken(key.client_email, key.private_key);
  cache = { token, expiresAt: Date.now() + 3_600_000 };
  return token;
}

async function fetchToken(email: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await signJwt(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    privateKeyPem,
  );

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    throw new Error(`OAuth token error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function signJwt(header: object, payload: object, pemKey: string): Promise<string> {
  const enc = new TextEncoder();
  const hb64 = b64url(enc.encode(JSON.stringify(header)));
  const pb64 = b64url(enc.encode(JSON.stringify(payload)));
  const toSign = `${hb64}.${pb64}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(pemKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(toSign));
  return `${toSign}.${b64url(new Uint8Array(sig))}`;
}

function b64url(data: Uint8Array): string {
  let bin = '';
  for (const b of data) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
