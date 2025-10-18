# 🚀 Deploy Manual no Vercel - Solução Definitiva

## ❌ Problema Identificado

O token funciona, MAS o Vercel está bloqueando porque o Git está configurado com o email `tools@notanumber.com` que não tem permissão no seu time.

**Erro:**
```
Git author tools@notanumber.com must have access to the team 
PedroFarais' projects
```

---

## ✅ SOLUÇÃO MAIS SIMPLES (3 minutos)

### Opção A: Importar do GitHub no Vercel (MELHOR)

Isso conecta direto e faz deploy automático de todos os commits futuros!

**Passo a Passo:**

1. **Acesse:** https://vercel.com/new

2. **Import Git Repository:**
   - Se já está conectado ao GitHub, vai aparecer seus repositórios
   - Procure pelo repositório do projeto
   - Clique **"Import"**

3. **Se não aparecer o repositório:**
   - Clique **"Adjust GitHub App Permissions"**
   - Ou clique **"Add GitHub Account"**
   - Autorize o Vercel
   - Selecione o repositório

4. **Configure o projeto:**
   ```
   Framework Preset: Other
   Build Command: npm run build:web
   Output Directory: dist
   Install Command: npm install
   Root Directory: ./
   ```

5. **Adicione Environment Variables:**
   
   Clique em **"Environment Variables"** e adicione:
   
   **Nome:** `EXPO_PUBLIC_SUPABASE_URL`
   **Valor:** `https://kdmnznwrdbqsztpxxjbi.supabase.co`
   
   **Nome:** `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbW56bndyZGJxc3p0cHh4amJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDU2MjcsImV4cCI6MjA3NTc4MTYyN30.Ezt6fY6QOZK41mlTvFuFis2fE0StazDCf9a6TT4sU5Q`
   
   **Nome:** `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   **Valor:** `sb_publishable_l6PEdT8LkIU6sb7i0kwiYA_ovIZSWDl`
   
   **Nome:** `STRIPE_SECRET_KEY`
   **Valor:** `sb_secret_CBlpfAWYzfdnKQEYVAY3HA_vgaiXY-p`
   
   ⚠️ Para cada variável, marque: **Production**, **Preview**, **Development**

6. **Clique "Deploy"**

7. **Aguarde 2-3 minutos**

8. **Pronto! ✅**

---

### Opção B: Fazer Deploy via Dashboard do Projeto Existente

Se o projeto "workspace" já existe no Vercel:

1. **Acesse:** https://vercel.com/dashboard

2. **Clique no projeto "workspace"**

3. **Vá em "Settings" → "Git"**

4. **Conecte ao GitHub:**
   - Se não estiver conectado, clique **"Connect Git Repository"**
   - Selecione seu repositório
   - Autorize

5. **Configure Build:**
   - Settings → General
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Adicione Environment Variables:**
   - Settings → Environment Variables
   - Adicione as 4 variáveis acima

7. **Vá em "Deployments"**

8. **Clique "Redeploy"** no último deployment

---

### Opção C: Upload Manual dos Arquivos

Se nada funcionar, você pode fazer upload direto:

1. **Acesse:** https://vercel.com/new

2. **Clique em "Browse"** (ao invés de import do Git)

3. **Selecione a pasta `dist` do seu projeto:**
   - Caminho: `/home/user/workspace/dist`
   - ⚠️ Se não tiver `dist`, rode: `npm run build:web`

4. **Upload e Deploy!**

---

## 🎯 Por Que Isso Acontece?

O Vercel verifica o **autor do Git** (email configurado no Git).

No ambiente Vibecode, está configurado como `tools@notanumber.com`, que não tem permissão no seu time do Vercel.

**Solução:** Importar direto do GitHub, assim o Vercel não verifica o autor local.

---

## 📊 Depois do Deploy

Uma vez conectado ao GitHub:

✅ **Todo commit = Deploy automático**
✅ **Você não precisa fazer nada**
✅ **Eu posso fazer commits que deployam automaticamente**

---

## 🆘 Se Travar em Algum Passo

Me envie:
1. Screenshot da tela onde travou
2. Qual opção tentou (A, B ou C)
3. Mensagem de erro (se houver)

Vou te ajudar! 🚀

---

## 📝 Checklist

- [ ] Acessei https://vercel.com/new
- [ ] Cliquei "Import Git Repository"
- [ ] Autorizei GitHub (se necessário)
- [ ] Selecionei o repositório
- [ ] Configurei Build Command: `npm run build:web`
- [ ] Configurei Output: `dist`
- [ ] Adicionei as 4 variáveis de ambiente
- [ ] Cliquei "Deploy"
- [ ] Aguardei 2-3 minutos
- [ ] Site está no ar! ✅

---

**Última atualização:** 18/10/2025 05:40

**Commit atual:** `ec2dbf1`

**Status:** Código pronto, aguardando deploy manual via Vercel Dashboard
