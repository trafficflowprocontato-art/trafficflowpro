# 🔍 Debug Status - Cliente/Despesa Errors

## ✅ Latest Updates (Commit: 80bebc4)

### Fixed Issues

1. **Async/Await Problem in AddClientScreen**
   - `handleSave()` was NOT async, so errors were not being caught properly
   - Now properly uses `await addClient()` and `await updateClient()`
   - Errors are now caught and displayed to the user

2. **Enhanced Error Logging in financialStore.ts**
   - Added comprehensive logging to `addClient()` function
   - Added detailed Supabase response logging
   - Error messages now show Supabase details (message, details, hint)

### Debug Logs Added

#### In `financialStore.ts` → `addClient()`:
```
🔍 addClient - userId: <UUID>
📤 Enviando cliente para Supabase: <data>
📥 Resposta Supabase (cliente) - data: <response>
📥 Resposta Supabase (cliente) - error: <error details>
💰 Cliente pago - criando comissão...
📤 Criando comissão: <commission data>
📥 Resposta Supabase (comissão) - data: <response>
📥 Resposta Supabase (comissão) - error: <error details>
✅ Cliente inserido com sucesso!
```

#### In `financialStore.ts` → `addAgencyExpense()`:
```
🔍 addAgencyExpense - userId: <UUID>
📤 Enviando para Supabase: <data>
📥 Resposta Supabase - data: <response>
📥 Resposta Supabase - error: <error details>
✅ Despesa adicionada com sucesso!
```

## 🧪 How to Debug

### Step 1: Test Adding a Client
1. Open the app in web browser (F12 → Console)
2. Try to add a new client
3. **Check the console logs** - you'll see:
   - What userId is being used
   - Exact data being sent to Supabase
   - Full error response from Supabase

### Step 2: Test Adding an Expense
1. Go to Expenses screen
2. Try to add a new expense
3. **Check the console logs** - same as above

### Step 3: Share the Logs
When you encounter an error, copy/paste or screenshot:
- The `📤 Enviando...` log (shows what data is being sent)
- The `📥 Resposta Supabase - error:` log (shows exact error)

## 🔧 Common Supabase Errors

### Error: "new row violates row-level security policy"
**Cause:** RLS policies blocking the insert
**Fix:** Run `fix-agency-expenses-table.sql` in Supabase SQL Editor

### Error: "duplicate key value violates unique constraint"
**Cause:** Trying to insert a record with an ID that already exists
**Fix:** Check if the client/expense already exists, or use a different ID generation

### Error: "column does not exist"
**Cause:** Database table structure doesn't match the code
**Fix:** Check Supabase table schema matches the data being sent

### Error: "null value in column violates not-null constraint"
**Cause:** Required field is missing or null
**Fix:** Check all required fields are being sent (user_id, name, value, etc.)

## 📋 Next Steps

1. **Test the app** and see what error appears in console
2. **Copy the error details** from the console logs
3. **Share the logs** so I can identify the exact issue
4. **Run SQL fixes** if needed (I'll guide you)

## 🎯 Most Likely Issues

Based on the previous errors:

### For Clients:
- ✅ RLS policies may be blocking inserts
- ✅ user_id mismatch (auth.uid() vs stored userId)
- ✅ Missing required columns in database

### For Expenses:
- ✅ Same as above
- ✅ Category column issue (already fixed - removed from code)

## 📝 Files Modified

- `src/state/financialStore.ts` - Added debug logs + better error handling
- `src/screens/AddClientScreen.tsx` - Made handleSave async + better error display

## 🚀 Deployment

Latest code pushed to GitHub (commit: 80bebc4)
Vercel should auto-deploy (if webhooks are configured)

---

**Ready to debug!** Open the app, try adding a client or expense, and share the console logs with me.
