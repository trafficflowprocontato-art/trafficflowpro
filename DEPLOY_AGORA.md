# 🚀 Guia Completo de Deploy - TrafficFlow Pro

## ✅ Status Atual
Seu projeto está 100% pronto para deploy! Todos os arquivos estão configurados.

---

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisa ter:

### 1. **Conta no Supabase** (Banco de Dados)
- Acesse: https://supabase.com
- Crie uma conta gratuita
- Crie um novo projeto
- Anote as credenciais (vamos usar depois)

### 2. **Conta no Stripe** (Pagamentos)
- Acesse: https://stripe.com
- Crie uma conta
- Ative o modo de teste
- Anote as chaves API (vamos usar depois)

### 3. **Conta no Vercel** (Hospedagem)
- Acesse: https://vercel.com
- Crie uma conta (pode usar GitHub)

---

## 🎯 Passo a Passo Completo

### **ETAPA 1: Configurar o Supabase**

1. **Acesse seu projeto no Supabase**
   - Vá em `Settings` > `API`
   - Copie a `Project URL`
   - Copie a `anon public` key

2. **Criar as tabelas do banco de dados**
   - Vá em `SQL Editor`
   - Clique em `New Query`
   - Cole o conteúdo do arquivo `subscriptions-setup.sql` (está no seu projeto)
   - Clique em `Run` para executar
   - ✅ Pronto! Suas tabelas estão criadas

3. **Configurar autenticação**
   - Vá em `Authentication` > `URL Configuration`
   - Em `Site URL` coloque: `https://seu-dominio.vercel.app`
   - Em `Redirect URLs` adicione:
     - `https://seu-dominio.vercel.app/app`
     - `https://seu-dominio.vercel.app/reset-password`

---

### **ETAPA 2: Configurar o Stripe**

1. **Criar os produtos de assinatura**
   - Acesse: https://dashboard.stripe.com/test/products
   - Clique em `Create product`

2. **Criar 3 produtos (um para cada plano):**

   **Produto 1: Starter**
   - Nome: `TrafficFlow Pro - Starter`
   - Preço: R$ 29,00
   - Tipo: `Recurring` (Mensal)
   - Período de teste: 7 dias
   - Copie o `Price ID` (começa com `price_...`)

   **Produto 2: Pro**
   - Nome: `TrafficFlow Pro - Pro`
   - Preço: R$ 49,00
   - Tipo: `Recurring` (Mensal)
   - Período de teste: 7 dias
   - Copie o `Price ID`

   **Produto 3: Premium**
   - Nome: `TrafficFlow Pro - Premium`
   - Preço: R$ 99,00
   - Tipo: `Recurring` (Mensal)
   - Período de teste: 7 dias
   - Copie o `Price ID`

3. **Copiar as chaves API**
   - Vá em `Developers` > `API keys`
   - Copie a `Publishable key` (começa com `pk_test_...`)
   - Copie a `Secret key` (começa com `sk_test_...`)
   - ⚠️ NUNCA compartilhe a Secret key!

---

### **ETAPA 3: Deploy no Vercel**

Escolha uma das duas opções abaixo:

---

#### **OPÇÃO A: Deploy via Dashboard (Mais Fácil)** ⭐ RECOMENDADO

1. **Acesse o Vercel**
   - Vá em: https://vercel.com/new
   - Faça login com GitHub, GitLab ou BitBucket

2. **Importar seu repositório**
   - Clique em `Import Git Repository`
   - Selecione o repositório do TrafficFlow Pro
   - Clique em `Import`

3. **Configurar o projeto**
   - **Project Name:** `trafficflowpro` (ou o nome que preferir)
   - **Framework Preset:** `Other`
   - **Build Command:** `bun run build:web`
   - **Output Directory:** `dist`
   - **Install Command:** `bun install`

4. **Adicionar variáveis de ambiente**
   
   Clique em `Environment Variables` e adicione:

   ```
   EXPO_PUBLIC_SUPABASE_URL = sua_url_do_supabase
   EXPO_PUBLIC_SUPABASE_ANON_KEY = sua_anon_key_do_supabase
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
   STRIPE_SECRET_KEY = sk_test_...
   SUPABASE_SERVICE_ROLE_KEY = sua_service_role_key_do_supabase
   ```

   **Onde encontrar cada uma:**
   - Supabase URL e Keys: `Settings` > `API` no Supabase
   - Stripe Keys: `Developers` > `API keys` no Stripe

5. **Deploy!**
   - Clique em `Deploy`
   - Aguarde 2-3 minutos
   - ✅ Pronto! Seu site está no ar!

6. **Teste seu site**
   - Acesse a URL que o Vercel forneceu (algo como `trafficflowpro.vercel.app`)
   - Você verá a landing page na raiz
   - Clique em "Entrar" para acessar o app

---

#### **OPÇÃO B: Deploy via CLI (Linha de Comando)**

Se preferir usar o terminal:

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel --prod
```

Durante o processo, responda:
- **Set up and deploy?** Yes
- **Which scope?** (Escolha sua conta)
- **Link to existing project?** No
- **Project name?** trafficflowpro
- **Directory?** ./ (deixe vazio)
- **Override settings?** Yes
- **Build Command?** bun run build:web
- **Output Directory?** dist
- **Install Command?** bun install

Depois adicione as variáveis de ambiente:

```bash
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
vercel env add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## 🎉 Após o Deploy

### 1. **Teste o fluxo completo:**

✅ **Landing Page:**
- Acesse `https://seu-dominio.vercel.app/`
- Verifique se a landing page carrega
- Clique em "Entrar" e veja se vai para o login

✅ **Registro:**
- Crie uma conta nova
- Verifique se recebe email de confirmação (se configurou no Supabase)

✅ **Login:**
- Faça login com a conta criada
- Verifique se entra no dashboard

✅ **Assinatura:**
- Tente criar uma assinatura
- Use o cartão de teste do Stripe: `4242 4242 4242 4242`
- Qualquer CVC, data futura

✅ **Dashboard:**
- Adicione um cliente
- Adicione uma despesa
- Verifique se os cálculos estão corretos

---

## 🔧 Configurações Adicionais (Opcional)

### **Domínio Personalizado**
1. Vá no dashboard do Vercel
2. Clique em `Settings` > `Domains`
3. Adicione seu domínio personalizado
4. Siga as instruções para configurar DNS

### **Webhooks do Stripe**
Para receber notificações automáticas de pagamento:

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em `Add endpoint`
3. URL: `https://seu-dominio.vercel.app/api/stripe-webhook`
4. Eventos: Selecione:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o `Signing secret`
6. Adicione no Vercel: `STRIPE_WEBHOOK_SECRET`

⚠️ **Nota:** Você ainda não tem a rota de webhook criada. Veja o arquivo `WEBHOOK_SETUP.md` para implementar.

---

## 📊 Monitoramento

### **Ver logs do Vercel:**
```bash
vercel logs seu-dominio.vercel.app
```

### **Ver logs do Supabase:**
- Acesse seu projeto
- Vá em `Logs`

### **Ver logs do Stripe:**
- Acesse `Developers` > `Logs`

---

## 🆘 Problemas Comuns

### **Erro: "Invalid API Key"**
- Verifique se as variáveis de ambiente estão corretas no Vercel
- Certifique-se de não ter espaços antes/depois das chaves

### **Erro: "Network Error" no login**
- Verifique a URL do Supabase nas variáveis de ambiente
- Confirme que as tabelas foram criadas corretamente

### **Erro de pagamento no Stripe**
- Verifique se as chaves são do modo teste (começam com `pk_test` e `sk_test`)
- Use o cartão de teste: `4242 4242 4242 4242`

### **Landing page não carrega**
- Verifique se o arquivo `landing.html` está na pasta `dist`
- Rode `bun run build:web` novamente
- Faça um novo deploy

---

## 📝 Checklist Final

Antes de anunciar seu site:

- [ ] Supabase configurado e tabelas criadas
- [ ] Stripe configurado com 3 planos
- [ ] Deploy no Vercel concluído
- [ ] Variáveis de ambiente adicionadas
- [ ] Landing page funcionando
- [ ] Login e registro funcionando
- [ ] Assinatura de teste funcionando
- [ ] Dashboard carregando corretamente
- [ ] Testado adicionar cliente
- [ ] Testado adicionar despesa
- [ ] Cálculos de lucro funcionando

---

## 🚀 Próximos Passos

1. **Passar para produção:**
   - Ative o Stripe em modo produção
   - Troque as chaves de teste pelas de produção
   - Configure um domínio personalizado

2. **Marketing:**
   - Compartilhe a landing page
   - Configure Google Analytics
   - Adicione pixel do Facebook

3. **Melhorias:**
   - Adicionar mais recursos
   - Melhorar design
   - Adicionar notificações

---

## 🎊 Parabéns!

Seu TrafficFlow Pro está no ar! 🎉

Qualquer dúvida, consulte os outros arquivos de documentação:
- `STRIPE_COMPLETE.md` - Detalhes do sistema de assinatura
- `WEBHOOK_SETUP.md` - Como configurar webhooks
- `SUPABASE_SETUP.md` - Mais detalhes do banco de dados
- `LANDING_PAGE_GUIDE.md` - Detalhes da landing page

---

**Criado com ❤️ para TrafficFlow Pro**
