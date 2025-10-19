# 🧪 COMO TESTAR SE O SISTEMA DE TRIAL/ASSINATURA ESTÁ FUNCIONANDO

## 📋 Checklist de Verificação:

### 1️⃣ **Cache do Navegador**
O código foi atualizado, mas o navegador pode estar usando versão antiga.

**Solução:**
- Pressione **Ctrl + Shift + R** (Windows/Linux)
- Ou **Cmd + Shift + R** (Mac)
- Ou abra uma **aba anônima** (Ctrl + Shift + N)

---

### 2️⃣ **Verificar se o código novo está no ar**

Abra o **Console do Navegador** (F12):

```javascript
// Cole isso no console:
localStorage.getItem('financial-storage')
```

Isso mostra os dados salvos. Se aparecer dados antigos, limpe:

```javascript
// Limpar cache:
localStorage.clear()
// Depois dê refresh (F5)
```

---

### 3️⃣ **Como saber se deu certo - TESTES:**

#### **Teste A: Usuário SEM assinatura (trial gratuito)**

1. Faça logout
2. Crie nova conta de teste
3. Após login, deve aparecer:
   - ✅ Banner azul: "X dias restantes"
   - ✅ Texto: "Período Gratuito"
   - ✅ Botão "Assinar Agora"

4. Depois de 7 dias (ou altere manualmente):
   - ✅ Banner amarelo: "Período Gratuito Expirado"
   - ✅ Texto: "Assine para continuar..."
   - ✅ Botão "Ver Planos"

---

#### **Teste B: Usuário COM assinatura ativa**

Você precisa de uma conta com subscription no banco.

**Verificar no Supabase:**

1. Abra o Supabase Dashboard
2. Vá em `subscriptions` table
3. Procure por `user_id` da sua conta
4. Deve ter:
   - `status = 'active'`
   - `current_period_end` = data futura
   - `stripe_subscription_id` = ID da subscription

**Resultado esperado no app:**
- ❌ **SEM banner de trial**
- ✅ Acesso completo
- ✅ Pode criar/editar/excluir

---

### 4️⃣ **Verificar Logs do Console**

Abra o console (F12) e procure por:

```
🔵 [authStore] Calculando trial info...
✅ [authStore] Login completo!
📝 Nenhuma subscription encontrada - usando trial gratuito de 7 dias
```

Ou se tiver subscription:
```
✅ Subscription saved successfully
```

---

### 5️⃣ **Forçar verificação de subscription**

No console do navegador:

```javascript
// Forçar re-check
const authStore = window.__ZUSTAND_STORES__?.auth
if (authStore) {
  authStore.getState().checkSubscription()
  authStore.getState().calculateTrialInfo()
}
```

---

### 6️⃣ **Simular usuário com subscription (para teste)**

#### **Opção 1: Inserir manualmente no Supabase**

```sql
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
) VALUES (
  'SEU_USER_ID_AQUI',
  'cus_test_123',
  'sub_test_123',
  'pro',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  false
);
```

Substitua `SEU_USER_ID_AQUI` pelo ID do seu usuário.

#### **Opção 2: Fazer pagamento teste no Stripe**

1. Vá em "Ver Planos"
2. Escolha um plano
3. Use cartão de teste: `4242 4242 4242 4242`
4. Webhook vai atualizar automaticamente

---

### 7️⃣ **Deploy está atualizado?**

Verifique se o Vercel fez o deploy:

1. Acesse: https://vercel.com/seu-projeto/deployments
2. Último deploy deve ser mais recente que o commit `ba55a1c`
3. Status: "Ready" (verde)

Se não atualizou:
- Vai em Settings → Git
- Trigger "Redeploy"

---

## 🐛 **Possíveis Problemas:**

### **Problema 1: Banner ainda aparece com subscription ativa**

**Causa:** Cache ou subscription não foi carregada do banco

**Solução:**
```javascript
// No console:
localStorage.clear()
location.reload()
```

### **Problema 2: Subscription no banco mas não reconhecida**

**Causa:** `checkSubscription()` não foi chamada

**Solução:**
- Fazer logout e login novamente
- Ou forçar no console (código acima)

### **Problema 3: Código antigo ainda no ar**

**Causa:** Vercel não fez deploy ou cache do CDN

**Solução:**
- Aguardar 2-3 minutos
- Limpar cache do navegador
- Verificar hash do JS no HTML (deve ser diferente)

---

## ✅ **RESULTADO ESPERADO APÓS CORREÇÃO:**

| Situação | Banner Visível? | Acesso Completo? |
|----------|----------------|------------------|
| Trial ativo (dia 1-6) | ✅ "X dias restantes" | ✅ Sim |
| Trial expirado (dia 7+) | ✅ "Expirado" | ❌ Não |
| Subscription ativa | ❌ Nenhum banner | ✅ Sim |
| Subscription past_due | ✅ "Expirado" | ❌ Não |
| Subscription canceled | ✅ "Expirado" | ❌ Não |

---

## 📞 **Como confirmar que está OK:**

Envie print ou diga:
1. Você tem subscription ativa no banco? (verificar Supabase)
2. Qual banner aparece no Dashboard?
3. O que aparece no console (F12)?

Com essas informações posso te ajudar melhor! 🚀
