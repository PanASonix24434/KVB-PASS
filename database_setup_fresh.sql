-- Fresh database setup (DROPS EXISTING TABLE - USE WITH CAUTION)
-- This will delete all existing data in the users table

-- Drop the table if it exists (WARNING: This deletes all data!)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
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

-- Create indexes for faster lookups
CREATE INDEX idx_users_ic_number ON users(ic_number);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading all users
CREATE POLICY "Allow read all users" ON users
  FOR SELECT
  USING (true);

-- Create policy to allow updating users
CREATE POLICY "Allow update users" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow inserting new users
CREATE POLICY "Allow insert users" ON users
  FOR INSERT
  WITH CHECK (true);
