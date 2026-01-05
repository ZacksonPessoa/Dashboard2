const express = require("express");
require("dotenv").config();

const { getAuthUrl, exchangeCodeForToken, getMe } = require("../src/mlAuth");
const { saveToken, loadToken } = require("../src/tokenStore");

const app = express();
app.use(express.json());

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
    await saveToken(tokenData);

    res.send({ ok: true, message: "Token salvo com sucesso!" });
  } catch (err) {
    res.status(500).send({ ok: false, error: err?.response?.data || err.message });
  }
});

app.get("/ml/me", async (req, res) => {
  try {
    const tokenData = await loadToken();
    if (!tokenData?.access_token) return res.status(401).send("Sem token salvo.");

    const me = await getMe(tokenData.access_token);
    res.send(me);
  } catch (err) {
    res.status(500).send({ ok: false, error: err?.response?.data || err.message });
  }
});

module.exports = app;
