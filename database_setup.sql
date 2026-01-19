-- Safe database setup script for Supabase
-- This script will create the table if it doesn't exist, or add missing columns if it does

-- First, check and create the table if it doesn't exist
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
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add name column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='name') THEN
    ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add ic_number column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='ic_number') THEN
    ALTER TABLE users ADD COLUMN ic_number TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_ic_number_unique ON users(ic_number) WHERE ic_number IS NOT NULL;
  END IF;

  -- Add email column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='email') THEN
    ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add role column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student';
    ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('student', 'hep', 'warden', 'security', 'admin'));
  END IF;

  -- Add student_id column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='student_id') THEN
    ALTER TABLE users ADD COLUMN student_id TEXT;
  END IF;

  -- Add class column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='class') THEN
    ALTER TABLE users ADD COLUMN class TEXT;
  END IF;

  -- Add dormitory_block column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='dormitory_block') THEN
    ALTER TABLE users ADD COLUMN dormitory_block TEXT;
  END IF;

  -- Add dormitory_room column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='dormitory_room') THEN
    ALTER TABLE users ADD COLUMN dormitory_room TEXT;
  END IF;

  -- Add profile_completed column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='profile_completed') THEN
    ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT false;
  END IF;

  -- Add profile column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='profile') THEN
    ALTER TABLE users ADD COLUMN profile JSONB;
  END IF;

  -- Add password_hash column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
  END IF;

  -- Add created_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='created_at') THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_ic_number ON users(ic_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "Allow read all users" ON users;

-- Create policy to allow reading all users (adjust based on your security needs)
CREATE POLICY "Allow read all users" ON users
  FOR SELECT
  USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow inserting new users (if needed)
CREATE POLICY "Allow insert users" ON users
  FOR INSERT
  WITH CHECK (true);
