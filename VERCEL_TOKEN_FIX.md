# 🔧 Corrigir Permissão do Token no Vercel

## ✅ O Que Consegui Fazer

1. ✅ **Token aceito** pelo Vercel
2. ✅ **Projeto linkado**: `workspace` (ID: `prj_vikxje81woabQKIUHKihYSR2ILSY`)
3. ✅ **Time identificado**: `PedroFarais' projects`

## ❌ Problema

O token não tem permissão para fazer deploy no time. 

**Erro:**
```
Git author tools@notanumber.com must have access to the team 
PedroFarais' projects on Vercel to create deployments.
```

---

## 🔧 Soluções (Escolha 1)

### Solução 1: Dar Permissão ao Token (Mais Rápido - 2 min)

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto **"workspace"**
3. Vá em **"Settings"** → **"Members"**
4. Adicione o email: **tools@notanumber.com**
5. Role: **Developer** ou **Owner**
6. Clique **"Invite"**

Depois que fizer isso, me avise que vou rodar o deploy novamente!

---

### Solução 2: Criar Novo Token com Permissões Corretas (3 min)

1. Acesse: https://vercel.com/account/tokens
2. **Delete o token antigo** (se quiser)
3. Clique **"Create Token"**
4. **Nome:** "Deploy Token"
5. **Expiration:** 30 dias (ou sem expiração)
6. **Scope:** 
   - Marque **"Full Access"** ✅
   - OU selecione apenas o projeto "workspace"
7. Clique **"Create"**
8. **Copie o novo token** e me envie

---

### Solução 3: Me Adiciona como Member (Mais Fácil - 1 min)

Ao invés de usar token, me adiciona direto:

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **"workspace"**
3. Vá em **"Settings"** → **"Members"**
4. Clique **"Invite"**
5. Digite um email temporário (pode ser um que você crie)
6. Role: **Developer**
7. Me passa o link de convite que aparece

---

### Solução 4: Reconectar GitHub no Vercel (Melhor para Longo Prazo)

Se o Vercel já está conectado ao seu GitHub:

1. Acesse: https://vercel.com/dashboard
2. Vá em **"Add New"** → **"Project"**
3. Procure seu repositório
4. Se não aparecer:
   - Clique **"Adjust GitHub App Permissions"**
   - Autorize acesso ao repositório
5. Importe o projeto
6. Configure as variáveis de ambiente:

```
EXPO_PUBLIC_SUPABASE_URL
https://kdmnznwrdbqsztpxxjbi.supabase.co

EXPO_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbW56bndyZGJxc3p0cHh4amJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDU2MjcsImV4cCI6MjA3NTc4MTYyN30.Ezt6fY6QOZK41mlTvFuFis2fE0StazDCf9a6TT4sU5Q

EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
sb_publishable_l6PEdT8LkIU6sb7i0kwiYA_ovIZSWDl

STRIPE_SECRET_KEY
sb_secret_CBlpfAWYzfdnKQEYVAY3HA_vgaiXY-p
```

7. Deploy!

Depois disso, **todo commit faz deploy automático**!

---

## 🎯 Qual Solução Recomendo?

### Para Agora (Rápido):
**Solução 1** - Adicionar tools@notanumber.com como member

### Para Futuro (Automático):
**Solução 4** - Conectar GitHub direto no Vercel

---

## 📊 Status Atual

- ✅ Projeto linkado ao Vercel
- ✅ Build funcionando localmente
- ✅ Código no GitHub atualizado
- ❌ Precisa de permissão para fazer deploy

---

## 🚀 Depois que Resolver

Me avise qual solução escolheu e:

- Se for Solução 1: Me avise que adicionou o email
- Se for Solução 2: Me envie o novo token
- Se for Solução 3: Me envie o link de convite
- Se for Solução 4: Me diga quando terminar de configurar

Aí eu faço o deploy imediatamente! 🎯
