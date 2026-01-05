const express = require("express");

// Imports ajustados para apontar para ml-automation/src a partir da raiz
const { getAuthUrl, exchangeCodeForToken, getMe } = require("../ml-automation/src/mlAuth");
const { saveTokenKV } = require("../ml-automation/src/tokenStoreKV");
const { getValidAccessToken } = require("../ml-automation/src/mlTokenManager");
const { getQuestionById } = require("../ml-automation/src/mlQuestions");

const app = express();

app.use(express.json());

// No Vercel, quando acessamos /api/auth/ml, a função serverless
// já recebe a requisição com o path correto (sem o prefixo /api)
// Então não precisamos remover o prefixo manualmente

app.get("/", (req, res) => res.send("ML Automation API - Vercel OK"));

app.get("/auth/ml", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

app.get("/auth/ml/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send("Faltou o code no callback.");

    const tokenData = await exchangeCodeForToken(code);
    await saveTokenKV(tokenData);

    return res.send({
      ok: true,
      message: "Token salvo com sucesso (Redis)"
    });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      error: err?.response?.data || err.message
    });
  }
});

app.get("/ml/me", async (req, res) => {
  try {
    const accessToken = await getValidAccessToken();
    const me = await getMe(accessToken);

    return res.send(me);
  } catch (err) {
    return res.status(500).send({
      ok: false,
      error: err?.response?.data || err.message
    });
  }
});

app.post("/webhook/ml", async (req, res) => {
  try {
    // DEBUG: ver o que chega de verdade
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const event = req.body;
    console.log("📩 Webhook ML recebido:", JSON.stringify(event));

    // Responde rápido pro ML (boa prática)
    res.status(200).send({ ok: true });

    if (!event?.topic || !event?.resource) {
      console.log("⚠️ body sem topic/resource (provável body vazio).");
      return;
    }

    const accessToken = await getValidAccessToken();

    // ✅ 1) PERGUNTAS PÚBLICAS (MVP)
    if (event.topic === "questions") {
      const questionId = event.resource.split("/").pop();
      console.log("Question ID:", questionId);

      const question = await getQuestionById(questionId, accessToken);

      console.log("✅ Pergunta recebida (texto):", {
        id: question?.id,
        item_id: question?.item_id,
        text: question?.text,
        from: question?.from?.id,
        status: question?.status,
        date_created: question?.date_created
      });

      return;
    }

    // (Opcional) 2) MENSAGENS PRIVADAS (deixa pronto, mas não é foco agora)
    if (event.topic === "messages") {
      const resourcePath = event.resource;

      const axios = require("axios");
      const { data } = await axios.get(`https://api.mercadolibre.com${resourcePath}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      console.log("✅ Detalhe da mensagem (resumo):", {
        id: data?.id,
        from: data?.from?.user_id,
        to: data?.to?.user_id,
        date_received: data?.date_received,
        text_preview: (data?.text || "").slice(0, 80)
      });

      return;
    }
  } catch (err) {
    console.log("❌ Erro processando webhook ML:", err?.response?.data || err.message);
    // não reenvie erro pro ML aqui porque já respondemos 200
  }
});

// Exporta o app para o Vercel
module.exports = app;
