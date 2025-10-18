# 🚨 Network Request Failed - SOLUTION

## 🔴 Current Error
**"Network request failed"** when adding clients or expenses

This error occurs in: `/node_modules/whatwg-fetch/dist/fetch.umd.js:567`

## ✅ Root Cause Identified

The "Network request failed" error is a **CORS (Cross-Origin Resource Sharing)** or **authentication** issue between your web app and Supabase.

✅ **Confirmed:** Supabase API is online and responding (tested with curl)
❌ **Problem:** Browser is blocking the requests due to CORS or auth issues

## 🔧 IMMEDIATE FIX - 3 Steps

### Step 1: Configure Supabase CORS (5 minutes)

1. Go to https://supabase.com/dashboard
2. Select project: **kdmnznwrdbqsztpxxjbi**
3. Click **Settings** (⚙️) → **API**
4. Scroll to **"URL Configuration"**
5. Add these URLs:

**Site URL:**
```
http://localhost:8081
```

**Additional Redirect URLs** (click "Add URL" for each):
```
http://localhost:8081
http://localhost:19006
http://127.0.0.1:8081
https://*.vercel.app
```

6. Click **Save**

### Step 2: Temporarily Disable RLS for Testing (2 minutes)

⚠️ **TEMPORARY ONLY** - We'll re-enable properly after testing

1. Go to **SQL Editor** in Supabase
2. Run this SQL:

```sql
-- TEMPORARY: Disable RLS to test
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions DISABLE ROW LEVEL SECURITY;
```

3. Click **Run**

### Step 3: Test the App (1 minute)

1. **Refresh your web app**
2. **Open Console** (F12 → Console)
3. **Try adding a client**
4. **Check console logs** - you should see:

```
🔐 Auth Check - Session: ✅ Authenticated
🔍 addClient - userId from store: <your-user-id>
🔍 addClient - userId from auth: <your-user-id>
📤 Enviando cliente para Supabase: {...}
📥 Resposta Supabase (cliente) - data: [{...}]
✅ Cliente inserido com sucesso!
```

---

## 🎯 If It Works After Step 2

**Great!** The issue was RLS policies. Now let's fix them properly:

1. Go to **SQL Editor** in Supabase
2. Run this complete SQL script:

```sql
-- RE-ENABLE RLS with proper policies

-- 1. Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_commissions ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies
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

3. **Test again** - adding clients should still work!

---

## 🔍 If It Still Doesn't Work After Step 2

Then it's **NOT an RLS issue** - it's authentication or CORS.

**Share these debug logs with me:**

1. Open Console (F12 → Console)
2. Try adding a client
3. Copy/paste or screenshot these logs:
   - `🔐 Auth Check - ...`
   - `🔍 addClient - ...`
   - `📥 Resposta Supabase - error: ...`

4. Also check **Network tab** (F12 → Network):
   - Look for red/failed requests
   - Click on failed request
   - Share the error message

---

## 📋 Quick Checklist

- [ ] Step 1: Configure CORS in Supabase API settings
- [ ] Step 2: Temporarily disable RLS
- [ ] Step 3: Test adding a client
- [ ] If works: Re-enable RLS with proper policies
- [ ] If doesn't work: Share console logs

---

## 🎯 Expected Result

After completing all steps, you should be able to:
- ✅ Add clients without errors
- ✅ Add expenses without errors
- ✅ See all data persist in Supabase
- ✅ Data is properly secured with RLS (only you can see your data)

---

**Latest code pushed:** Commit `49f444e`

**Files to reference:**
- `SUPABASE_CORS_FIX.md` - Detailed CORS troubleshooting
- `DEBUG_STATUS.md` - Debug guide
- `fix-agency-expenses-table.sql` - Complete table setup script

**Need help?** Share the console logs and I'll help debug further!
