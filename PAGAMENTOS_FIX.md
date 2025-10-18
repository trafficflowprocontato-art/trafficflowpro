# 🔧 Correção do Sistema de Pagamentos

## ❌ Problema Identificado

**Você marca um cliente como "PAGO" mas quando recarrega a página, volta para "PENDENTE"**

### Causa Raiz

O sistema estava salvando o status de pagamento **APENAS na memória local** (estado do React), mas **NÃO estava salvando no banco de dados Supabase**.

Especificamente:
- ✅ Salvava `paymentStatus: "paid"` no Supabase
- ❌ **NÃO** salvava `lastPaymentMonth` no Supabase
- ❌ Função `updateClient()` não tinha `lastPaymentMonth` mapeado para o Supabase

## ✅ Correções Implementadas

### 1. Adicionado `lastPaymentMonth` ao `updateClient()`

**Arquivo:** `src/state/financialStore.ts`

```typescript
// ANTES (linha 279) - NÃO salvava lastPaymentMonth
if (updatedClient.extraExpenses) updateData.extra_expenses = updatedClient.extraExpenses;

// DEPOIS - Agora salva lastPaymentMonth, contractStartDate e firstPaymentMonth
if (updatedClient.extraExpenses) updateData.extra_expenses = updatedClient.extraExpenses;
if (updatedClient.lastPaymentMonth !== undefined) updateData.last_payment_month = updatedClient.lastPaymentMonth;
if (updatedClient.contractStartDate !== undefined) updateData.contract_start_date = updatedClient.contractStartDate;
if (updatedClient.firstPaymentMonth !== undefined) updateData.first_payment_month = updatedClient.firstPaymentMonth;
```

### 2. Adicionado Logs de Debug em `updateClient()`

Agora quando você marcar como pago, verá no console:
```
🔍 updateClient - id: cliente-123
🔍 updateClient - updatedClient: {lastPaymentMonth: "2025-10", paymentStatus: "paid"}
📤 Atualizando cliente no Supabase: {last_payment_month: "2025-10", payment_status: "paid"}
📥 Resposta Supabase (update) - data: [...]
✅ Cliente atualizado no Supabase com sucesso!
```

### 3. Corrigido `handleMarkAsPaid` para ser async

**Arquivo:** `src/screens/PaymentsScreen.tsx`

```typescript
// ANTES - NÃO esperava o update terminar
onPress: () => {
  updateClient(client.id, {
    ...client,  // ❌ Enviava dados desnecessários
    lastPaymentMonth: currentMonth,
    paymentStatus: "paid"
  });
}

// DEPOIS - Usa await e trata erros
onPress: async () => {
  try {
    await updateClient(client.id, {
      lastPaymentMonth: currentMonth,  // ✅ Só envia o necessário
      paymentStatus: "paid"
    });
    Alert.alert("Sucesso", `${client.name} foi marcado como pago!`);
  } catch (error) {
    Alert.alert("Erro", "Não foi possível marcar como pago.");
  }
}
```

### 4. Melhorado mensagem de confirmação

Agora mostra o mês que está sendo marcado:
```
"Marcar João Silva como PAGO neste mês (2025-10)?"
```

## 🗄️ Atualização do Banco de Dados Necessária

Você precisa adicionar a coluna `last_payment_month` na tabela `clients` do Supabase.

### Como Fazer

1. Abra **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto: **kdmnznwrdbqsztpxxjbi**
3. Vá em **SQL Editor**
4. Cole e execute este script:

```sql
-- Adicionar coluna last_payment_month na tabela clients

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'last_payment_month'
    ) THEN
        ALTER TABLE clients 
        ADD COLUMN last_payment_month TEXT;
        
        RAISE NOTICE 'Coluna last_payment_month adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna last_payment_month já existe!';
    END IF;
END $$;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;
```

5. Clique **Run**
6. Você deve ver a mensagem: **"Coluna last_payment_month adicionada com sucesso!"**

## 🧪 Como Testar

### Teste 1: Marcar como Pago
1. **Abra o app** e vá para "Cobranças"
2. **Abra o Console** do navegador (F12 → Console)
3. **Clique em "Marcar como Pago"** em um cliente pendente
4. **Verifique os logs:**
   ```
   💰 Marcando cliente como pago: João Silva
   💰 Mês: 2025-10
   🔍 updateClient - id: ...
   📤 Atualizando cliente no Supabase: {...}
   📥 Resposta Supabase (update) - data: [...]
   ✅ Cliente atualizado no Supabase com sucesso!
   ✅ Cliente marcado como pago com sucesso!
   ```
5. **Recarregue a página** (F5)
6. **Verifique:** O cliente deve **continuar marcado como PAGO** ✅

### Teste 2: Verificar no Supabase
1. Vá para **Supabase Dashboard** → **Table Editor**
2. Abra a tabela **clients**
3. Encontre o cliente que você marcou como pago
4. **Verifique as colunas:**
   - `payment_status` = "paid" ✅
   - `last_payment_month` = "2025-10" (ou o mês atual) ✅

## 📋 Checklist

- [ ] Executar SQL no Supabase para adicionar coluna `last_payment_month`
- [ ] Recarregar o app (ou fazer hard refresh: Ctrl+Shift+R)
- [ ] Abrir Console do navegador (F12)
- [ ] Marcar um cliente como pago
- [ ] Verificar logs no console (deve mostrar sucesso)
- [ ] Recarregar página (F5)
- [ ] Confirmar que cliente continua marcado como pago ✅
- [ ] Verificar no Supabase Table Editor se dados foram salvos

## 🎯 Resultado Esperado

### Antes da Correção ❌
```
1. Marca como pago → Aparece "Pago" ✅
2. Recarrega página → Volta para "Pendente" ❌
3. Dados perdidos!
```

### Depois da Correção ✅
```
1. Marca como pago → Aparece "Pago" ✅
2. Salva no Supabase → last_payment_month = "2025-10" ✅
3. Recarrega página → Continua "Pago" ✅
4. Dados persistem! ✅
```

## 🐛 Se Ainda Não Funcionar

### Cenário 1: Console mostra "❌ userId não definido em updateClient"
**Solução:** Você não está logado. Faça login novamente.

### Cenário 2: Console mostra "column 'last_payment_month' does not exist"
**Solução:** Execute o SQL acima no Supabase para criar a coluna.

### Cenário 3: Console mostra "Network request failed"
**Solução:** Siga os passos em `NETWORK_ERROR_SOLUTION.md` para configurar CORS.

### Cenário 4: Console mostra "new row violates row-level security"
**Solução:** Execute o SQL em `NETWORK_ERROR_SOLUTION.md` para configurar RLS.

---

## 📝 Arquivos Modificados

- ✅ `src/state/financialStore.ts` - Adicionado lastPaymentMonth + logs
- ✅ `src/screens/PaymentsScreen.tsx` - Corrigido async/await + mensagens
- ✅ `add-last-payment-month-column.sql` - SQL para adicionar coluna

**Commit:** `f9076c6`

---

**Pronto!** Execute o SQL no Supabase e teste. Os pagamentos agora vão persistir corretamente! 🚀
