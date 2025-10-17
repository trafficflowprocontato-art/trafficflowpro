# 🚀 Guia Completo: Colocar Landing Page + App no Ar

## ✅ Status Atual

Tudo já está pronto e commitado no Git:
- ✅ Landing Page criada
- ✅ Sistema de assinaturas implementado
- ✅ Rotas configuradas
- ✅ Tudo commitado

## 🚀 PASSO A PASSO PARA DEPLOY

### OPÇÃO 1: Via Vercel CLI (MAIS RÁPIDO - 2 minutos)

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Deploy para produção (na pasta do projeto)
cd /home/user/workspace
vercel --prod
```

**Pronto!** Em 2-3 minutos seu site está no ar! 🎉

### OPÇÃO 2: Via Vercel Dashboard (MAIS FÁCIL - 5 minutos)

1. Acesse: https://vercel.com/
2. Faça login
3. Clique: "Add New" → "Project"
4. Importe seu repositório (GitHub/GitLab)
5. Configure:
   - Build Command: `bun run build:web`
   - Output Directory: `dist`
6. Clique "Deploy"
7. Aguarde 2-3 minutos

**Pronto!** Seu site está no ar! 🎉

## 🌐 URLs Após Deploy

```
https://seu-projeto.vercel.app/       → Landing Page
https://seu-projeto.vercel.app/app    → App (Login)
```

## ⚙️ Configurar Variáveis de Ambiente

No Vercel Dashboard:

1. Vá em: Settings → Environment Variables
2. Adicione:

```
EXPO_PUBLIC_SUPABASE_URL=sua_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

3. Clique "Save"
4. Redeploy: `vercel --prod`

## 🎯 Checklist Final

- [ ] Deploy feito
- [ ] Landing page abrindo (/)
- [ ] App abrindo (/app)
- [ ] Variáveis de ambiente configuradas
- [ ] Executou SQL do Supabase (subscriptions-setup.sql)
- [ ] Testou criar conta
- [ ] Testou login
- [ ] Testou trial de 7 dias

## 🆘 Problemas Comuns

**Landing page não aparece:**
- Verifique se `landing.html` está em `/web/`
- Limpe cache no Vercel e redeploy

**App não funciona:**
- Verifique variáveis de ambiente
- Redeploy após adicionar env vars

**Erro 404:**
- Verifique `vercel.json`
- Redeploy

## 🎉 Pronto!

Seu site está no ar! 🚀

**Teste tudo:**
1. Abra a landing page
2. Clique "Entrar"
3. Crie uma conta
4. Veja se o trial foi criado
5. Teste o app

---

**Documentação completa:**
- Sistema de assinaturas: `STRIPE_COMPLETE.md`
- Webhooks: `WEBHOOK_SETUP.md`
- Landing page: `LANDING_PAGE_GUIDE.md`
