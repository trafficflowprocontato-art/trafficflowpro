-- Adicionar coluna contract_start_date na tabela clients
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS contract_start_date DATE;

-- Adicionar comentário na coluna
COMMENT ON COLUMN clients.contract_start_date IS 'Data de início do contrato do cliente';

-- Verificar se foi criada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'contract_start_date';
