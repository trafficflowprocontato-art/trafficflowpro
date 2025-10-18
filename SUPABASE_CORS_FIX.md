# 🔧 Fixing "Network request failed" Error

## ❌ Problem
You're seeing: **"Network request failed"** when trying to add clients/expenses.

This is a **CORS (Cross-Origin Resource Sharing)** issue - Supabase is blocking requests from your web domain.

## ✅ Solution: Configure CORS in Supabase

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: **kdmnznwrdbqsztpxxjbi**

### Step 2: Navigate to API Settings
1. Click on **"Settings"** in left sidebar (gear icon ⚙️)
2. Click on **"API"** tab
3. Scroll down to **"URL Configuration"** section

### Step 3: Add Your Domain to Allowed Origins

You need to add these URLs to the **"Site URL"** and **"Redirect URLs"** fields:

**For Local Development:**
```
http://localhost:8081
http://localhost:19006
http://127.0.0.1:8081
```

**For Vercel Deployment:**
```
https://your-app.vercel.app
https://*.vercel.app
```

### Step 4: Enable CORS for Development

1. In the same **API** settings page
2. Look for **"Authentication"** section
3. Make sure **"Enable Email Confirmations"** is OFF (for testing)
4. Under **"URL Configuration"**, add your development URLs

### Step 5: Alternative - Disable RLS Temporarily (Testing Only)

⚠️ **WARNING: Only for debugging! Don't do this in production!**

If you want to test if RLS is the issue:

1. Go to **SQL Editor** in Supabase
2. Run this command for each table:

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions DISABLE ROW LEVEL SECURITY;
```

3. Test adding a client/expense
4. **If it works**, the issue was RLS policies (not CORS)
5. **Re-enable RLS immediately** after testing:

```sql
-- Re-enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;
```

## 🔍 Diagnosing the Issue

### Check if it's CORS:
- ✅ Open browser DevTools (F12)
- ✅ Go to **Network** tab
- ✅ Try adding a client
- ✅ Look for requests to `kdmnznwrdbqsztpxxjbi.supabase.co`
- ✅ If you see **"CORS error"** or **"Access-Control-Allow-Origin"**, it's CORS

### Check if it's RLS:
- ✅ Open browser Console (F12 → Console)
- ✅ Look for error message containing:
  - **"new row violates row-level security policy"**
  - **"RLS"**
  - **"policy"**
- ✅ If you see these, run the `fix-agency-expenses-table.sql` script

## 📋 Proper RLS Setup

Once CORS is fixed, run this SQL in Supabase to properly configure RLS:

```sql
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own expenses" ON agency_expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON agency_expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON agency_expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON agency_expenses;

DROP POLICY IF EXISTS "Users can view own commissions" ON seller_commissions;
DROP POLICY IF EXISTS "Users can insert own commissions" ON seller_commissions;
DROP POLICY IF EXISTS "Users can update own commissions" ON seller_commissions;
DROP POLICY IF EXISTS "Users can delete own commissions" ON seller_commissions;

-- 3. Create proper policies for CLIENTS
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create proper policies for AGENCY_EXPENSES
CREATE POLICY "Users can view own expenses"
  ON agency_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON agency_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON agency_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON agency_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Create proper policies for SELLER_COMMISSIONS
CREATE POLICY "Users can view own commissions"
  ON seller_commissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commissions"
  ON seller_commissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commissions"
  ON seller_commissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commissions"
  ON seller_commissions FOR DELETE
  USING (auth.uid() = user_id);
```

## 🎯 Quick Checklist

- [ ] Add localhost URLs to Supabase API settings
- [ ] Add Vercel URLs to Supabase API settings
- [ ] Check browser Network tab for CORS errors
- [ ] Check browser Console for RLS errors
- [ ] Run proper RLS SQL script
- [ ] Test adding client again

## 📝 Expected Outcome

After fixing CORS + RLS, you should see these logs in console:
```
🔍 addClient - userId: abc-123-def
📤 Enviando cliente para Supabase: {...}
📥 Resposta Supabase (cliente) - data: [{...}]
✅ Cliente inserido com sucesso!
```

---

**Need help?** Share a screenshot of:
1. Browser Network tab (showing the failed request)
2. Browser Console (showing the error message)
