const axios = require("axios");

function getAuthUrl() {
  const appId = process.env.ML_APP_ID;
  const redirectUri = encodeURIComponent(process.env.ML_REDIRECT_URI);

  // state é opcional, mas recomendado (anti-CSRF). Vamos deixar simples por agora.
  return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${appId}&redirect_uri=${redirectUri}`;
}

async function exchangeCodeForToken(code) {
  const url = "https://api.mercadolibre.com/oauth/token";

  const payload = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.ML_APP_ID,
    client_secret: process.env.ML_CLIENT_SECRET,
    code,
    redirect_uri: process.env.ML_REDIRECT_URI
  });

  const { data } = await axios.post(url, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  return data;
}

async function getMe(accessToken) {
  const { data } = await axios.get("https://api.mercadolibre.com/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return data;
}

async function refreshAccessToken(refreshToken) {
  const url = "https://api.mercadolibre.com/oauth/token";

  const payload = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ML_APP_ID,
    client_secret: process.env.ML_CLIENT_SECRET,
    refresh_token: refreshToken
  });

  const { data } = await axios.post(url, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  return data; // vem com access_token novo (e às vezes refresh_token novo)
}

module.exports = { getAuthUrl, exchangeCodeForToken, getMe, refreshAccessToken };

