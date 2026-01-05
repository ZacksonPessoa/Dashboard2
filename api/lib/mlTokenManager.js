const { loadTokenKV, saveTokenKV } = require("./tokenStoreKV");
const { refreshAccessToken } = require("./mlAuth");

async function getValidAccessToken() {
  const tokenData = await loadTokenKV();

  if (!tokenData) {
    throw new Error("Token não encontrado. Faça o OAuth novamente.");
  }

  // Se ainda não expirou, usa o atual
  if (tokenData.access_token && tokenData.expires_at && Date.now() < tokenData.expires_at) {
    return tokenData.access_token;
  }

  // Se expirou, tenta refresh
  if (!tokenData.refresh_token) {
    throw new Error("Sem refresh_token. Refaça o OAuth.");
  }

  const newTokenData = await refreshAccessToken(tokenData.refresh_token);
  
  // Preserva o refresh_token se não vier na resposta (às vezes o ML não retorna)
  if (!newTokenData.refresh_token && tokenData.refresh_token) {
    newTokenData.refresh_token = tokenData.refresh_token;
  }
  
  const saved = await saveTokenKV(newTokenData);

  return saved.access_token;
}

module.exports = { getValidAccessToken };

