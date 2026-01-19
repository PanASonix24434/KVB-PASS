# Quick Start: Connect to Supabase

## 1. Get Your Credentials

Visit: https://supabase.com/dashboard/project/dnnwtbmgspvlkejupotp/settings/api

Copy:
- **Project URL**
- **anon/public key**

## 2. Create `.env` File

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=paste_your_project_url_here
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

## 3. Set Up Database

Go to SQL Editor in Supabase and run the SQL from `SUPABASE_SETUP.md` to create the `users` table.

## 4. Restart Dev Server

```bash
npm run dev
```

That's it! Your app is now connected to Supabase.

For detailed instructions, see `SUPABASE_SETUP.md`.
