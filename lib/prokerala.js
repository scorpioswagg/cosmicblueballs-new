// Prokerala API (OAuth2 client credentials). Used as enrichment if available.
let _tokenCache = null;

export async function getProkeralaToken() {
  if (_tokenCache && _tokenCache.expiresAt > Date.now() + 60000) return _tokenCache.token;
  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const resp = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.access_token) return null;
    _tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    return data.access_token;
  } catch (e) {
    console.error('Prokerala token error:', e.message);
    return null;
  }
}
