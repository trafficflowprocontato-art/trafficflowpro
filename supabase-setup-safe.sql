-- Tabela de clientes (se não existir)
CREATE TABLE IF NOT EXISTS clients (
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

-- Tabela de despesas da agência (se não existir)
CREATE TABLE IF NOT EXISTS agency_expenses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comissões de vendedores (se não existir)
CREATE TABLE IF NOT EXISTS seller_commissions (
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
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para clients
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can view own clients') THEN
    CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can insert own clients') THEN
    CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can update own clients') THEN
    CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can delete own clients') THEN
    CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas de acesso para agency_expenses
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_expenses' AND policyname = 'Users can view own expenses') THEN
    CREATE POLICY "Users can view own expenses" ON agency_expenses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_expenses' AND policyname = 'Users can insert own expenses') THEN
    CREATE POLICY "Users can insert own expenses" ON agency_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_expenses' AND policyname = 'Users can update own expenses') THEN
    CREATE POLICY "Users can update own expenses" ON agency_expenses FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agency_expenses' AND policyname = 'Users can delete own expenses') THEN
    CREATE POLICY "Users can delete own expenses" ON agency_expenses FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas de acesso para seller_commissions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_commissions' AND policyname = 'Users can view own commissions') THEN
    CREATE POLICY "Users can view own commissions" ON seller_commissions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_commissions' AND policyname = 'Users can insert own commissions') THEN
    CREATE POLICY "Users can insert own commissions" ON seller_commissions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_commissions' AND policyname = 'Users can update own commissions') THEN
    CREATE POLICY "Users can update own commissions" ON seller_commissions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seller_commissions' AND policyname = 'Users can delete own commissions') THEN
    CREATE POLICY "Users can delete own commissions" ON seller_commissions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
