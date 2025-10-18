-- Adicionar coluna last_payment_month na tabela clients

-- 1. Verificar se a coluna já existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'last_payment_month'
    ) THEN
        -- Adicionar a coluna
        ALTER TABLE clients 
        ADD COLUMN last_payment_month TEXT;
        
        RAISE NOTICE 'Coluna last_payment_month adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna last_payment_month já existe!';
    END IF;
END $$;

-- 2. Verificar estrutura final da tabela clients
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;
