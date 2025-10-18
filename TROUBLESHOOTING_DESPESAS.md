# 🔧 Troubleshooting - Adicionar Despesas

## 🐛 Problema Relatado:
"Quando adiciono despesa e clico publicar ele me redireciona para a mesma aba mas não cadastra a despesa"

---

## ✅ Correções Aplicadas:

### 1. **Validação de Category Removida**
- **Problema:** Código validava `!category.trim()` antes de adicionar
- **Solução:** Removida validação obrigatória, usa "Geral" como padrão
- **Linha:** ExpensesScreen.tsx:62

### 2. **Função handleAddExpense agora é async**
- **Problema:** Não esperava promessa de `addAgencyExpense()`
- **Solução:** Adicionado `async/await` com try/catch
- **Linha:** ExpensesScreen.tsx:49

### 3. **Tratamento de Erros Adicionado**
- **Problema:** Erros falhavam silenciosamente
- **Solução:** Alert com mensagem quando falha
- **Resultado:** Usuário agora sabe se deu erro

### 4. **Validação de Campos com Feedback**
- **Problema:** Não mostrava porque não adicionava
- **Solução:** Alert dizendo "preencha descrição e valor"

---

## 🧪 Como Testar:

### Teste 1: Adicionar Despesa Normal
1. Abra tela de Despesas
2. Clique em "+" para adicionar
3. Preencha:
   - **Descrição:** "Teste de Despesa"
   - **Valor:** "100"
   - **Categoria:** (deixe vazio ou preencha)
4. Clique em "Adicionar Despesa"
5. **Esperado:** Despesa aparece na lista

### Teste 2: Campos Vazios
1. Clique em "+" para adicionar
2. Deixe descrição vazia
3. Clique em "Adicionar Despesa"
4. **Esperado:** Alert pedindo para preencher campos

### Teste 3: Valor Inválido
1. Clique em "+" para adicionar
2. Preencha descrição
3. Deixe valor vazio
4. Clique em "Adicionar Despesa"
5. **Esperado:** Alert pedindo para preencher valor

---

## 🔍 Debug - O que Verificar:

Se ainda não funcionar, verifique:

### 1. Console do Navegador (F12)
Procure por erros tipo:
- `Erro ao adicionar despesa:`
- `PGRST204` (erro de coluna)
- Erros de rede

### 2. Network Tab
- Veja se há chamada para Supabase
- Status 200 = sucesso
- Status 400/500 = erro

### 3. Supabase Dashboard
- Vá em "Table Editor"
- Abra tabela `agency_expenses`
- Veja se despesa foi inserida
- Se inseriu mas não aparece = problema de estado

### 4. Estado Local
No console do navegador, execute:
```javascript
// Ver despesas no estado
const state = window.__ZUSTAND_STORE__; // se exposto
```

---

## 🐛 Problemas Conhecidos:

### ⚠️ Coluna `category` não existe no Supabase
- **Status:** Removida do código
- **Fix Permanente:** Execute `add-category-column-fix.sql` no Supabase
- **Workaround Atual:** Usa "Geral" hardcoded

### ⚠️ Reload não automático
- **Problema:** Lista pode não atualizar após adicionar
- **Workaround:** Navegar para outra aba e voltar
- **Fix:** Verificar se `set((state) => ...)` está funcionando

---

## 📦 Versão Atual:

- **Bundle:** `index-3bbb0b12f2d1dff95e86006d2de5d8af.js`
- **Commit:** `eb81d40`
- **Data:** 2025-10-18

---

## 🆘 Se o Problema Persistir:

1. **Limpe cache completamente:**
   ```
   Ctrl + Shift + Delete
   ```
   Marque "Cache" e "Cookies"

2. **Abra em aba anônima** para testar sem cache

3. **Verifique se deploy foi feito:**
   - Vá no Vercel Dashboard
   - Veja se há deploy com hash `3bbb0b12`

4. **Tire screenshot do console** e envie

5. **Me diga exatamente:**
   - O que digitou (descrição, valor, categoria)
   - O que aconteceu (alert, erro, nada)
   - O que viu no console (F12)

---

**Última atualização:** 2025-10-18 04:35 UTC
