# Vercel Environment Variables Setup

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### 1. DATABASE_URL
```
postgresql://postgres.wrkvgsouuqisjyiahrml:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```
(Replace YOUR_PASSWORD with your actual password, URL-encoded: `@` = `%40`, `!` = `%21`)

**Important:** 
- Add to: Production, Preview, and Development
- The password is URL-encoded: `@` = `%40`, `!` = `%21`

### 2. GROQ_API_KEY
```
your_groq_api_key_here
```
(Get from: https://console.groq.com)

**Important:**
- Add to: Production, Preview, and Development

### 3. NEXT_PUBLIC_APP_URL
```
https://kenmark-chatbot.vercel.app
```
(Replace with your actual Vercel app URL)

**Important:**
- Add to: Production, Preview, and Development

## Steps to Update in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Click **Add New**
   - Enter the **Name** and **Value**
   - Select **Production**, **Preview**, and **Development**
   - Click **Save**
4. After adding all variables, **Redeploy** your application

## Verification

After updating environment variables and redeploying:
1. Check Vercel function logs for any connection errors
2. Test the chatbot - it should work now
3. Test the admin panel - should load knowledge base

