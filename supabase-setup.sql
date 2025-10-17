-- Tabela de usuários (perfis)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_value NUMERIC NOT NULL,
  payment_status TEXT NOT NULL,
  payment_date INTEGER NOT NULL,
  seller_name TEXT NOT NULL,
  seller_commission NUMERIC NOT NULL,
  extra_expenses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de despesas da agência
CREATE TABLE agency_expenses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comissões de vendedores
CREATE TABLE seller_commissions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  commission_value NUMERIC NOT NULL,
  payment_status TEXT NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  month TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) para segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso: usuário só vê seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses" ON agency_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON agency_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON agency_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON agency_expenses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own commissions" ON seller_commissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commissions" ON seller_commissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commissions" ON seller_commissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commissions" ON seller_commissions
  FOR DELETE USING (auth.uid() = user_id);
