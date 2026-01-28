# Redeploy no Vercel

Para atualizar as modificações no Vercel, use uma das opções abaixo.

---

## Opção 1: Push no Git (recomendado)

Se o projeto está ligado a um repositório no Vercel, cada **push** gera um deploy automático.

```bash
cd c:\Users\User\Dashboard2

git add .
git status
git commit -m "feat: API lm-backend-vercel, credenciais ML, .env.example alinhado ao Vercel"
git push origin main
```

O Vercel fará o build e o deploy sozinho.

---

## Opção 2: Vercel CLI (produção)

1. Instale o Vercel CLI (se ainda não tiver):
   ```bash
   npm i -g vercel
   ```

2. **Frontend (raiz do Dashboard2):**
   ```bash
   cd c:\Users\User\Dashboard2
   npm run deploy
   ```
   Ou diretamente: `vercel --prod`

3. **Backend (lm-backend-vercel)** – se for um projeto separado no Vercel:
   ```bash
   cd c:\Users\User\Dashboard2\lm-backend-vercel
   vercel --prod
   ```

Na primeira vez, faça login com `vercel login` se pedir.

---

## Opção 3: Pelo painel do Vercel

1. Acesse [vercel.com](https://vercel.com) e entre na sua conta.
2. Abra o projeto (Dashboard2 ou api-mercado-livre-two).
3. Aba **Deployments** → no último deploy, clique nos **três pontinhos (⋯)**.
4. Escolha **Redeploy** e confirme.

Isso refaz o último deploy com o mesmo commit; para incluir alterações novas, use a **Opção 1** (push) ou a **Opção 2** (CLI a partir da pasta com as mudanças).
