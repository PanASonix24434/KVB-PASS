# Supabase Setup Instructions

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dnnwtbmgspvlkejupotp
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 2: Create Environment File

Create a `.env` file in the root of your project with the following content:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 1.

## Step 3: Set Up Database Tables

You'll need to create a `users` table in your Supabase database. Run this SQL in the Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ic_number TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'hep', 'warden', 'security', 'admin')),
  student_id TEXT,
  class TEXT,
  dormitory_block TEXT,
  dormitory_room TEXT,
  profile_completed BOOLEAN DEFAULT false,
  profile JSONB,
  password_hash TEXT, -- Store hashed passwords
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ic_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_ic_number ON users(ic_number);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- KVB-PASS uses custom auth (not Supabase Auth) with anon key
-- Allow full access for anon - app handles auth logic
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
CREATE POLICY "Allow all for anon" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
```

## Step 4: Insert Initial Users (Optional)

Add staff/admin users via the app's User Management, or run this SQL.
**Note:** Passwords are now hashed. Use "Lupa Kata Laluan" to set password after first login, or insert with a pre-hashed password.

```sql
-- Default password for these users: 123456 (use Lupa Kata Laluan to reset)
-- Password hashes are SHA-256(password + ic_number)
INSERT INTO users (name, ic_number, email, role, student_id, class, dormitory_block, dormitory_room, profile_completed, password_hash)
VALUES
  ('Tuan Rahimi', '012345678910', 'rahman@kv.edu.my', 'hep', NULL, NULL, NULL, NULL, false, 'placeholder'),
  ('Tuan Shah', '012345678911', 'fatimah@kv.edu.my', 'warden', NULL, NULL, NULL, NULL, false, 'placeholder'),
  ('Pengawal Keselamatan', '012345678912', 'azman@kv.edu.my', 'security', NULL, NULL, NULL, NULL, false, 'placeholder'),
  ('Encik Muhammad Ihsan', '061221110051', 'admin@kv.edu.my', 'admin', NULL, NULL, NULL, NULL, false, 'placeholder');
```

After inserting, use **Lupa Kata Laluan** on the login page to set a password for each user.

## Step 5: Restart Your Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Important Notes

- The `.env` file is already in `.gitignore`, so your credentials won't be committed to version control
- Make sure to use environment variables in production as well
- The app uses SHA-256 hashing for passwords (see src/lib/authUtils.ts)
- Adjust Row Level Security policies based on your application's security requirements
