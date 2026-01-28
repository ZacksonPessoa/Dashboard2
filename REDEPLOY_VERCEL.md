# Deploy no Vercel

**Importante:** toda vez que você atualizar o código (frontend ou backend), é preciso fazer um novo deploy no Vercel para as alterações entrarem no ar.

---

## Melhor opção: deploy automático (Git)

Conecte o repositório ao Vercel para que **cada push** dispare um deploy automático. Assim você não precisa fazer deploy manual toda vez.

### Como configurar (uma vez)

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. **Import Project** (ou **Add New** → **Project**).
3. Conecte o GitHub/GitLab/Bitbucket e escolha o repositório do projeto.
4. Para o **frontend** (Dashboard2): root = pasta raiz do repo, build = `npm run build`, output = `dist`.
5. Para o **backend** (lm-backend-vercel): se for outro projeto no Vercel, importe de novo com root = `lm-backend-vercel` (ou o repo só do backend).
6. Defina as **Environment Variables** de cada projeto (ex.: no backend: `ML_CLIENT_ID`, `ML_CLIENT_SECRET`, `ML_REDIRECT_URI`, `KV_REST_API_*`, etc.).

Depois disso, **sempre que der push**:

```bash
cd c:\Users\User\Dashboard2
git add .
git commit -m "sua mensagem"
git push origin main
```

o Vercel fará o build e o deploy sozinho.

---

## Deploy manual (quando não usar Git ou para forçar redeploy)

### Opção A: Vercel CLI

1. Instale e faça login (uma vez):
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Frontend** (a cada alteração no código do dashboard):
   ```bash
   cd c:\Users\User\Dashboard2
   npm run deploy
   ```
   ou: `vercel --prod`

3. **Backend** (a cada alteração no lm-backend-vercel):
   ```bash
   cd c:\Users\User\Dashboard2\lm-backend-vercel
   vercel --prod
   ```

### Opção B: Painel do Vercel

1. [vercel.com](https://vercel.com) → seu projeto.
2. **Deployments** → **⋯** no último deploy → **Redeploy**.

Redeploy pelo painel usa o **último commit** já enviado. Para subir código novo, use primeiro **Git push** (se o repo estiver conectado) ou **Vercel CLI** a partir da pasta com as alterações.

---

## Resumo

| Situação | O que fazer |
|----------|-------------|
| Repo conectado ao Vercel | `git push` → deploy automático |
| Código alterado, sem push | Rodar `vercel --prod` na pasta do projeto (front ou back) |
| Dois projetos (front + back) | Fazer deploy dos dois quando cada um for alterado |

**Lembrete:** toda atualização de código exige um novo deploy no Vercel para passar a valer em produção.
