# 🚀 Como Fazer Deploy no Vercel - Guia Completo

## 📋 O Que Você Precisa

### ✅ O Que Você JÁ TEM:

1. **Código no GitHub** ✅
   - Repositório: `https://git.vibecodeapp.com/...`
   - Branch: `main`
   - Último commit: `26b2e2f`

2. **Supabase Configurado** ✅
   - URL: `https://kdmnznwrdbqsztpxxjbi.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Stripe Configurado** ✅ (Sandbox)
   - Publishable Key: `sb_publishable_...`
   - Secret Key: `sb_secret_...`

### ❓ O Que Você PRECISA:

**NADA!** Você já tem tudo! Só precisa conectar o Vercel ao GitHub.

---

## 🎯 Passo a Passo para Deploy no Vercel

### Passo 1: Criar Conta no Vercel (2 minutos)

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** ✅ (Recomendado)
4. Autorize o Vercel a acessar seus repositórios

---

### Passo 2: Importar Projeto (3 minutos)

1. No Vercel Dashboard, clique **"Add New"** → **"Project"**
2. Clique **"Import Git Repository"**
3. Autorize o Vercel a acessar seu GitHub
4. Selecione o repositório do seu projeto
5. Clique **"Import"**

---

### Passo 3: Configurar Build (1 minuto)

Na tela de configuração:

**Framework Preset:** `Other`

**Build & Development Settings:**
```
Build Command: npm run build:web
Output Directory: dist
Install Command: npm install
```

**Root Directory:** `.` (deixe vazio)

---

### Passo 4: Adicionar Variáveis de Ambiente (2 minutos)

Na mesma tela, role até **"Environment Variables"** e adicione:

#### Variáveis OBRIGATÓRIAS:

```
EXPO_PUBLIC_SUPABASE_URL
Valor: https://kdmnznwrdbqsztpxxjbi.supabase.co

EXPO_PUBLIC_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbW56bndyZGJxc3p0cHh4amJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDU2MjcsImV4cCI6MjA3NTc4MTYyN30.Ezt6fY6QOZK41mlTvFuFis2fE0StazDCf9a6TT4sU5Q
```

#### Variáveis OPCIONAIS (Stripe - apenas se for usar pagamentos):

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
Valor: sb_publishable_l6PEdT8LkIU6sb7i0kwiYA_ovIZSWDl

STRIPE_SECRET_KEY
Valor: sb_secret_CBlpfAWYzfdnKQEYVAY3HA_vgaiXY-p
```

**⚠️ IMPORTANTE:** Para cada variável, selecione **"Production"**, **"Preview"** e **"Development"**

---

### Passo 5: Deploy! (1 minuto)

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos (Vercel vai fazer o build)
3. Quando aparecer **"Congratulations!"** → Pronto! ✅

---

## 🔄 Como Fazer Deploy Novamente (Atualizar)

### Método 1: Automático (Recomendado)

Depois da primeira configuração, todo `git push` faz deploy automático:

```bash
# 1. Eu faço mudanças no código
# 2. Faço commit e push
git add -A
git commit -m "suas mudanças"
git push origin main

# 3. Vercel detecta e deploya automaticamente (2-3 min)
```

### Método 2: Manual

1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **"Deployments"**
4. Clique no último deployment
5. Clique **"Redeploy"**

---

## 🔑 Onde Pegar Novas Credenciais

### Supabase (Se precisar renovar ou criar novo projeto)

1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto (ou crie novo)
3. Vá em **"Settings"** → **"API"**
4. Copie:
   - **URL:** Aparece em "Project URL"
   - **Anon Key:** Aparece em "Project API keys" → "anon" → "public"

**Para me enviar:**
```
EXPO_PUBLIC_SUPABASE_URL=<cole aqui>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<cole aqui>
```

---

### Stripe (Se precisar trocar ou usar produção)

#### Para Sandbox (Testes):
1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie:
   - **Publishable key:** Começa com `pk_test_...`
   - **Secret key:** Começa com `sk_test_...` (clique "Reveal")

#### Para Produção (Dinheiro real):
1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie:
   - **Publishable key:** Começa com `pk_live_...`
   - **Secret key:** Começa com `sk_live_...`

**Para me enviar:**
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<cole aqui>
STRIPE_SECRET_KEY=<cole aqui>
```

---

## 🔧 Como Atualizar Credenciais no Vercel

Se precisar trocar as chaves:

1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **"Settings"** → **"Environment Variables"**
4. Encontre a variável que quer trocar
5. Clique nos 3 pontinhos (⋮) → **"Edit"**
6. Cole o novo valor
7. Clique **"Save"**
8. **IMPORTANTE:** Faça um novo deploy para aplicar:
   - Vá em "Deployments"
   - Clique "Redeploy" no último deployment

---

## 🆘 Se Eu Precisar Fazer Deploy Para Você

### O Que Você Me Envia:

**Opção 1: Me dá acesso ao Vercel (Mais Fácil)**
```
1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em "Settings" → "Members"
4. Clique "Invite"
5. Digite meu email (você me passa no privado)
6. Selecione role: "Developer" ou "Owner"
7. Clique "Invite"
```

**Opção 2: Me passa o Vercel Token**
```
1. Acesse https://vercel.com/account/tokens
2. Clique "Create Token"
3. Nome: "Deploy Token"
4. Expiration: 30 dias
5. Scope: Selecione seu projeto
6. Clique "Create"
7. Copie o token (começa com vercel_...)
8. Me envia em mensagem privada
```

**Opção 3: Reconectar GitHub (Se perdeu conexão)**

Se o Vercel não está deployando:
```
1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto
3. Settings → Git
4. Clique "Disconnect"
5. Clique "Connect Git Repository"
6. Selecione seu repositório
7. Configure como no Passo 3 acima
```

---

## 🎯 Resumo do Que Você Tem

```
✅ Código no GitHub
✅ Supabase configurado
✅ Stripe configurado (sandbox)
✅ .env com todas as variáveis
✅ vercel.json configurado
✅ Build funcionando (testado)

❓ Falta apenas: Conectar Vercel ao GitHub
```

---

## 📝 Checklist Completo

### Setup Inicial (Só faz 1 vez):
- [ ] Criar conta no Vercel (com GitHub)
- [ ] Importar projeto do GitHub
- [ ] Configurar build commands
- [ ] Adicionar variáveis de ambiente
- [ ] Fazer primeiro deploy
- [ ] Verificar se funcionou

### Deploys Futuros (Automático):
- [ ] Eu faço mudanças no código
- [ ] Faço commit e push
- [ ] Vercel deploya sozinho
- [ ] Você só limpa cache e testa

---

## 💡 Dicas Importantes

1. **Cache:** Sempre limpe cache após deploy (`Ctrl+Shift+R`)

2. **Verificar Deploy:** 
   - Vercel Dashboard → Deployments
   - Status deve estar "Ready" (verde)

3. **Logs de Erro:**
   - Se deploy falhar, clique no deployment
   - Veja os logs para identificar erro

4. **Domínio:**
   - Vercel dá um domínio grátis: `seu-projeto.vercel.app`
   - Pode adicionar domínio próprio em Settings → Domains

5. **Preview Deployments:**
   - Cada commit faz um preview deploy
   - Útil para testar antes de ir para produção

---

## 📊 Status Atual

- ✅ **Código:** Pronto e atualizado (commit `26b2e2f`)
- ✅ **Build:** Funcionando
- ✅ **Credenciais:** Todas configuradas
- ❓ **Vercel:** Precisa conectar ao GitHub

**Próximo passo:** Seguir Passo 1 → Criar conta no Vercel

---

## 🆘 Precisa de Ajuda?

Se tiver dúvida em algum passo:

1. **Screenshot:** Me envie print da tela onde travou
2. **Erro:** Cole a mensagem de erro completa
3. **Passo:** Me diga qual passo está fazendo

Vou te ajudar a resolver! 🚀

---

**Última atualização:** 18/10/2025 05:30

**Commit atual:** `26b2e2f`
