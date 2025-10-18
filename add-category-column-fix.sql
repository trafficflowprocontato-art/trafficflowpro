-- SQL para adicionar coluna 'category' na tabela agency_expenses
-- Execute isso no SQL Editor do Supabase quando quiser habilitar categorias

-- Adicionar coluna category
ALTER TABLE agency_expenses 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';

-- Criar índice para melhor performance em queries por categoria
CREATE INDEX IF NOT EXISTS idx_agency_expenses_category 
ON agency_expenses(category);

-- Atualizar despesas existentes para ter categoria 'Geral'
UPDATE agency_expenses 
SET category = 'Geral' 
WHERE category IS NULL;

-- Comentário da coluna
COMMENT ON COLUMN agency_expenses.category IS 'Categoria da despesa (ex: Marketing, Infraestrutura, Salários, etc)';
