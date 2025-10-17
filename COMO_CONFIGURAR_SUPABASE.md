# 🔧 Como Configurar o Supabase

## ❌ Problema Identificado

**O registro de usuários não funciona porque as credenciais do Supabase não estão configuradas.**

---

## ✅ Solução: Configurar Supabase em 5 Passos

### 1️⃣ Criar Conta no Supabase (GRÁTIS)
- Acesse: https://supabase.com
- Clique em **"Start your project"**
- Faça login com GitHub ou email

### 2️⃣ Criar um Novo Projeto
- Clique em **"New Project"**
- Escolha um nome (ex: `trafficflowpro`)
- Crie uma senha forte para o banco de dados
- Escolha a região mais próxima (ex: `South America (São Paulo)`)
- Clique em **"Create new project"**
- ⏳ Aguarde 1-2 minutos para o projeto ser criado

### 3️⃣ Copiar as Credenciais
- No painel do projeto, vá em **Settings** (ícone de engrenagem)
- Clique em **API**
- Copie:
  - **Project URL** (ex: `https://abcdefgh.supabase.co`)
  - **anon public key** (uma chave longa começando com `eyJ...`)

### 4️⃣ Criar o Arquivo .env
- Na raiz do projeto, crie um arquivo chamado `.env`
- Cole as credenciais:

```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

⚠️ **IMPORTANTE:** Substitua pelos seus valores reais!

### 5️⃣ Configurar o Banco de Dados

Execute este SQL no Supabase:

1. Vá em **SQL Editor** no menu lateral
2. Clique em **"New query"**
3. Cole o SQL abaixo:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_value NUMERIC NOT NULL,
  payment_status TEXT NOT NULL,
  payment_date INTEGER NOT NULL,
  seller_name TEXT NOT NULL,
  seller_commission NUMERIC NOT NULL,
  extra_expenses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de despesas da agência
CREATE TABLE IF NOT EXISTS public.agency_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de comissões de vendedores
CREATE TABLE IF NOT EXISTS public.seller_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  commission_value NUMERIC NOT NULL,
  payment_status TEXT NOT NULL,
  paid_date TIMESTAMPTZ,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas de segurança para clients
CREATE POLICY "Users can view own clients" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clients
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para agency_expenses
CREATE POLICY "Users can view own expenses" ON public.agency_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.agency_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.agency_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.agency_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para seller_commissions
CREATE POLICY "Users can view own commissions" ON public.seller_commissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commissions" ON public.seller_commissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commissions" ON public.seller_commissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commissions" ON public.seller_commissions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
```

4. Clique em **"Run"** (ou pressione Ctrl+Enter)

---

## 6️⃣ Desabilitar Confirmação de Email (Opcional para Testes)

Por padrão, o Supabase exige que o usuário confirme o email. Para testes, você pode desabilitar:

1. Vá em **Authentication** > **Settings**
2. Desça até **"Email Auth"**
3. **Desmarque** a opção **"Enable email confirmations"**
4. Clique em **"Save"**

---

## 7️⃣ Reiniciar o Servidor

Após configurar:

1. Pare o servidor atual (Ctrl+C no terminal)
2. Reinicie com: `bun run web`
3. Aguarde o servidor iniciar
4. Teste criar uma conta novamente!

---

## ✅ Testando

Após configurar:

1. Abra o app no celular/navegador
2. Vá em **"Criar Conta"**
3. Preencha os dados
4. Clique em **"Criar Conta"**
5. ✅ Se tudo estiver certo, você será redirecionado para o Dashboard!

---

## 🆘 Problemas Comuns

### Erro: "Supabase não configurado"
- ✅ Verifique se o arquivo `.env` está na raiz do projeto
- ✅ Verifique se copiou as credenciais corretas
- ✅ Reinicie o servidor após criar o `.env`

### Erro: "Email not confirmed"
- ✅ Desabilite a confirmação de email (passo 6)
- ✅ Ou vá no email e confirme a conta

### Erro: "relation public.users does not exist"
- ✅ Execute o SQL do passo 5
- ✅ Verifique se todas as tabelas foram criadas

---

## 📞 Suporte

Se precisar de ajuda, me avise e eu posso:
- Verificar seus logs de erro
- Ajustar configurações
- Corrigir problemas no código

---

**Pronto! Agora seu sistema de registro vai funcionar perfeitamente! 🚀**
