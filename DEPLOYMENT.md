# Vercel Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect it's a Vite React app

3. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add these environment variables:
     - `REACT_APP_SUPABASE_URL` = your Supabase project URL
     - `REACT_APP_SUPABASE_ANON_KEY` = your Supabase anon key
     - `REACT_APP_SUPABASE_SERVICE_ROLE_KEY` = your service role key

4. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `your-project-name.vercel.app`

## Alternative: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and add your environment variables when asked.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase values:
```bash
cp .env.example .env.local
```

## Build Settings (Auto-detected by Vercel)

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
