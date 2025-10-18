-- SQL para verificar e corrigir tabela agency_expenses

-- 1. Verificar se tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'agency_expenses';

-- 2. Se não existir, criar tabela
CREATE TABLE IF NOT EXISTS agency_expenses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE agency_expenses ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own expenses" ON agency_expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON agency_expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON agency_expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON agency_expenses;

-- 5. Criar políticas de RLS
CREATE POLICY "Users can view own expenses"
  ON agency_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON agency_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON agency_expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON agency_expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Criar índices
CREATE INDEX IF NOT EXISTS idx_agency_expenses_user_id 
  ON agency_expenses(user_id);

CREATE INDEX IF NOT EXISTS idx_agency_expenses_created_at 
  ON agency_expenses(created_at DESC);

-- 7. Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_agency_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_agency_expenses_updated_at ON agency_expenses;

CREATE TRIGGER set_agency_expenses_updated_at
  BEFORE UPDATE ON agency_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_expenses_updated_at();

-- 8. Verificar estrutura final
\d agency_expenses;

-- 9. Listar políticas
SELECT * FROM pg_policies WHERE tablename = 'agency_expenses';
