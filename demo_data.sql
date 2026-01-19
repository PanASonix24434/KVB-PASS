-- Demo Data untuk Sistem KV Pass
-- Jalankan SQL ini di Supabase SQL Editor untuk memasukkan data demo

-- ============================================
-- 1. INSERT USERS (Pengguna)
-- ============================================

-- Pelajar 1
INSERT INTO users (name, ic_number, email, role, student_id, class, dormitory_block, dormitory_room, profile_completed, password_hash)
VALUES 
  ('Pelajar 1', '060501110209', 'pelajar1@student.kv.edu.my', 'student', 'KV2024001', 'Teknologi Maklumat', 'U', 'U1', true, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  student_id = EXCLUDED.student_id,
  class = EXCLUDED.class,
  dormitory_block = EXCLUDED.dormitory_block,
  dormitory_room = EXCLUDED.dormitory_room;

-- Pelajar 2
INSERT INTO users (name, ic_number, email, role, student_id, class, dormitory_block, dormitory_room, profile_completed, password_hash)
VALUES 
  ('Pelajar 2', '060614110373', 'pelajar2@student.kv.edu.my', 'student', 'KV2024002', 'Teknologi Elektrik', 'T', 'T3', true, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  student_id = EXCLUDED.student_id,
  class = EXCLUDED.class,
  dormitory_block = EXCLUDED.dormitory_block,
  dormitory_room = EXCLUDED.dormitory_room;

-- Pelajar 3 (untuk demo)
INSERT INTO users (name, ic_number, email, role, student_id, class, dormitory_block, dormitory_room, profile_completed, password_hash)
VALUES 
  ('Ahmad bin Abdullah', '050123110456', 'ahmad@student.kv.edu.my', 'student', 'KV2024003', 'Teknologi Automotif', 'U', 'U5', true, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  student_id = EXCLUDED.student_id,
  class = EXCLUDED.class,
  dormitory_block = EXCLUDED.dormitory_block,
  dormitory_room = EXCLUDED.dormitory_room;

-- Staff - HEP
INSERT INTO users (name, ic_number, email, role, profile_completed, password_hash)
VALUES 
  ('Tuan Rahimi', '012345678910', 'rahman@kv.edu.my', 'hep', false, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Staff - Warden
INSERT INTO users (name, ic_number, email, role, profile_completed, password_hash)
VALUES 
  ('Tuan Shah', '012345678911', 'fatimah@kv.edu.my', 'warden', false, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Security
INSERT INTO users (name, ic_number, email, role, profile_completed, password_hash)
VALUES 
  ('Pengawal Keselamatan', '012345678912', 'azman@kv.edu.my', 'security', false, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Admin
INSERT INTO users (name, ic_number, email, role, profile_completed, password_hash)
VALUES 
  ('Encik Muhammad Ihsan', '061221110051', 'admin@kv.edu.my', 'admin', false, '123456')
ON CONFLICT (ic_number) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- ============================================
-- 2. CREATE APPLICATIONS TABLE (jika belum ada)
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_ic TEXT NOT NULL,
  student_class TEXT NOT NULL,
  reason TEXT NOT NULL,
  exit_date DATE NOT NULL,
  exit_time TIME NOT NULL,
  return_date DATE NOT NULL,
  return_time TIME NOT NULL,
  destination TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  dormitory_block TEXT,
  dormitory_room TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approver_role TEXT CHECK (approver_role IN ('hep', 'warden')),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  digital_pass TEXT,
  routed_to TEXT CHECK (routed_to IN ('hep', 'warden')),
  routing_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists with different structure
DO $$ 
BEGIN
  -- Add application_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='application_id') THEN
    ALTER TABLE applications ADD COLUMN application_id TEXT UNIQUE;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);
  END IF;

  -- Add or alter student_id column (ensure it's TEXT, not UUID)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='student_id') THEN
    ALTER TABLE applications ADD COLUMN student_id TEXT NOT NULL DEFAULT '';
  ELSE
    -- Check if column type is UUID and change to TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='applications' 
               AND column_name='student_id' 
               AND udt_name='uuid') THEN
      -- Drop NOT NULL constraint first if exists
      ALTER TABLE applications ALTER COLUMN student_id DROP NOT NULL;
      -- Convert UUID to TEXT
      ALTER TABLE applications ALTER COLUMN student_id TYPE TEXT USING COALESCE(student_id::TEXT, '');
      ALTER TABLE applications ALTER COLUMN student_id SET NOT NULL;
      ALTER TABLE applications ALTER COLUMN student_id SET DEFAULT '';
    END IF;
  END IF;

  -- Add student_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='student_name') THEN
    ALTER TABLE applications ADD COLUMN student_name TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add student_ic if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='student_ic') THEN
    ALTER TABLE applications ADD COLUMN student_ic TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add student_class if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='student_class') THEN
    ALTER TABLE applications ADD COLUMN student_class TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add reason if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='reason') THEN
    ALTER TABLE applications ADD COLUMN reason TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add exit_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='exit_date') THEN
    ALTER TABLE applications ADD COLUMN exit_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Add exit_time if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='exit_time') THEN
    ALTER TABLE applications ADD COLUMN exit_time TIME NOT NULL DEFAULT '00:00:00';
  END IF;

  -- Add return_date if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='return_date') THEN
    ALTER TABLE applications ADD COLUMN return_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Add return_time if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='return_time') THEN
    ALTER TABLE applications ADD COLUMN return_time TIME NOT NULL DEFAULT '00:00:00';
  END IF;

  -- Add destination if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='destination') THEN
    ALTER TABLE applications ADD COLUMN destination TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add emergency_contact if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='emergency_contact') THEN
    ALTER TABLE applications ADD COLUMN emergency_contact TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add emergency_phone if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='emergency_phone') THEN
    ALTER TABLE applications ADD COLUMN emergency_phone TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add supporting_documents if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='supporting_documents') THEN
    ALTER TABLE applications ADD COLUMN supporting_documents JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add dormitory_block if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='dormitory_block') THEN
    ALTER TABLE applications ADD COLUMN dormitory_block TEXT;
  END IF;

  -- Add dormitory_room if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='dormitory_room') THEN
    ALTER TABLE applications ADD COLUMN dormitory_room TEXT;
  END IF;

  -- Add status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='status') THEN
    ALTER TABLE applications ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE applications ADD CONSTRAINT applications_status_check 
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;

  -- Add approved_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='approved_by') THEN
    ALTER TABLE applications ADD COLUMN approved_by TEXT;
  END IF;

  -- Add approver_role if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='approver_role') THEN
    ALTER TABLE applications ADD COLUMN approver_role TEXT;
    ALTER TABLE applications ADD CONSTRAINT applications_approver_role_check 
      CHECK (approver_role IS NULL OR approver_role IN ('hep', 'warden'));
  END IF;

  -- Add approved_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='approved_at') THEN
    ALTER TABLE applications ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add comments if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='comments') THEN
    ALTER TABLE applications ADD COLUMN comments TEXT;
  END IF;

  -- Add digital_pass if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='digital_pass') THEN
    ALTER TABLE applications ADD COLUMN digital_pass TEXT;
  END IF;

  -- Add routed_to if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='routed_to') THEN
    ALTER TABLE applications ADD COLUMN routed_to TEXT;
    ALTER TABLE applications ADD CONSTRAINT applications_routed_to_check 
      CHECK (routed_to IS NULL OR routed_to IN ('hep', 'warden'));
  END IF;

  -- Add routing_reason if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='routing_reason') THEN
    ALTER TABLE applications ADD COLUMN routing_reason TEXT;
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='created_at') THEN
    ALTER TABLE applications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='applications' AND column_name='updated_at') THEN
    ALTER TABLE applications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_application_id ON applications(application_id);

-- ============================================
-- 3. FIX student_id COLUMN TYPE (must be TEXT, not UUID)
-- Handle existing table with UUID column type
-- ============================================

-- Step 1: Disable RLS completely
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (using dynamic SQL to catch all)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'applications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON applications', r.policyname);
  END LOOP;
END $$;

-- Step 3: Convert student_id from UUID to TEXT if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'applications' 
    AND column_name = 'student_id' 
    AND udt_name = 'uuid'
  ) THEN
    -- Drop NOT NULL constraint first
    ALTER TABLE applications ALTER COLUMN student_id DROP NOT NULL;
    -- Convert UUID to TEXT
    ALTER TABLE applications ALTER COLUMN student_id TYPE TEXT USING COALESCE(student_id::TEXT, '');
    -- Restore NOT NULL constraint
    ALTER TABLE applications ALTER COLUMN student_id SET NOT NULL;
  END IF;
END $$;

-- Step 4: Re-enable RLS after column type conversion
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;

-- Step 5: Recreate policies after column type conversion
DROP POLICY IF EXISTS "Allow read all applications" ON applications;
CREATE POLICY "Allow read all applications" ON applications
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert applications" ON applications;
CREATE POLICY "Allow insert applications" ON applications
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update applications" ON applications;
CREATE POLICY "Allow update applications" ON applications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. INSERT SAMPLE APPLICATIONS (Permohonan)
-- ============================================

-- Permohonan 1: Pending (menunggu kelulusan)
INSERT INTO applications (
  application_id, student_id, student_name, student_ic, student_class,
  reason, exit_date, exit_time, return_date, return_time,
  destination, emergency_contact, emergency_phone, supporting_documents,
  dormitory_block, dormitory_room, status, created_at, updated_at
)
VALUES (
  '20240115001',
  'KV2024001',
  'Pelajar 1',
  '060501110209',
  'Teknologi Maklumat',
  'Balik kampung untuk cuti semester',
  CURRENT_DATE + INTERVAL '2 days',
  '08:00:00',
  CURRENT_DATE + INTERVAL '5 days',
  '20:00:00',
  'Kampung Baru, Kuala Lumpur',
  'Ibu - Puan Siti',
  '0123456789',
  '[]'::jsonb,
  'U',
  'U1',
  'pending',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Permohonan 2: Approved (diluluskan oleh HEP)
INSERT INTO applications (
  application_id, student_id, student_name, student_ic, student_class,
  reason, exit_date, exit_time, return_date, return_time,
  destination, emergency_contact, emergency_phone, supporting_documents,
  dormitory_block, dormitory_room, status, approved_by, approver_role,
  approved_at, digital_pass, created_at, updated_at
)
VALUES (
  '20240112002',
  'KV2024002',
  'Pelajar 2',
  '060614110373',
  'Teknologi Elektrik',
  'Menghadiri majlis perkahwinan saudara',
  CURRENT_DATE + INTERVAL '1 day',
  '09:00:00',
  CURRENT_DATE + INTERVAL '3 days',
  '18:00:00',
  'Seremban, Negeri Sembilan',
  'Bapa - Encik Ali',
  '0198765432',
  '["surat_jemputan.pdf"]'::jsonb,
  'T',
  'T3',
  'approved',
  'Tuan Rahimi',
  'hep',
  NOW() - INTERVAL '2 hours',
  'KVBP-240115-ABC123',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 hours'
);

-- Permohonan 3: Rejected (ditolak)
INSERT INTO applications (
  application_id, student_id, student_name, student_ic, student_class,
  reason, exit_date, exit_time, return_date, return_time,
  destination, emergency_contact, emergency_phone, supporting_documents,
  dormitory_block, dormitory_room, status, approved_by, approver_role,
  approved_at, comments, created_at, updated_at
)
VALUES (
  '20240110003',
  'KV2024001',
  'Pelajar 1',
  '060501110209',
  'Teknologi Maklumat',
  'Keluar untuk aktiviti peribadi',
  CURRENT_DATE - INTERVAL '3 days',
  '10:00:00',
  CURRENT_DATE - INTERVAL '1 day',
  '22:00:00',
  'KLCC, Kuala Lumpur',
  'Ibu - Puan Siti',
  '0123456789',
  '[]'::jsonb,
  'U',
  'U1',
  'rejected',
  'Tuan Shah',
  'warden',
  NOW() - INTERVAL '4 days',
  'Permohonan ditolak kerana tidak menyediakan dokumen sokongan yang diperlukan',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days'
);

-- Permohonan 4: Pending (baru dihantar)
INSERT INTO applications (
  application_id, student_id, student_name, student_ic, student_class,
  reason, exit_date, exit_time, return_date, return_time,
  destination, emergency_contact, emergency_phone, supporting_documents,
  dormitory_block, dormitory_room, status, created_at, updated_at
)
VALUES (
  '20240116004',
  'KV2024003',
  'Ahmad bin Abdullah',
  '050123110456',
  'Teknologi Automotif',
  'Rawatan perubatan di hospital',
  CURRENT_DATE + INTERVAL '3 days',
  '07:30:00',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  'Hospital Putrajaya',
  'Ibu - Puan Aminah',
  '0134567890',
  '["surat_doktor.pdf"]'::jsonb,
  'U',
  'U5',
  'pending',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
);

-- Permohonan 5: Approved dengan Digital Pass
INSERT INTO applications (
  application_id, student_id, student_name, student_ic, student_class,
  reason, exit_date, exit_time, return_date, return_time,
  destination, emergency_contact, emergency_phone, supporting_documents,
  dormitory_block, dormitory_room, status, approved_by, approver_role,
  approved_at, digital_pass, comments, created_at, updated_at
)
VALUES (
  '20240113005',
  'KV2024002',
  'Pelajar 2',
  '060614110373',
  'Teknologi Elektrik',
  'Program keluarga di rumah',
  CURRENT_DATE,
  '08:00:00',
  CURRENT_DATE + INTERVAL '2 days',
  '20:00:00',
  'Shah Alam, Selangor',
  'Bapa - Encik Ali',
  '0198765432',
  '[]'::jsonb,
  'T',
  'T3',
  'approved',
  'Tuan Rahimi',
  'hep',
  NOW() - INTERVAL '1 day',
  'KVBP-240113-XYZ789',
  'Diluluskan. Sila pastikan kembali mengikut masa yang ditetapkan.',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
);

-- ============================================
-- 5. CREATE SECURITY LOGS TABLE (jika belum ada)
-- ============================================

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('exit', 'return')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  security_officer TEXT NOT NULL,
  application_id TEXT NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_logs_student_id ON security_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_application_id ON security_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow read all security logs" ON security_logs;
CREATE POLICY "Allow read all security logs" ON security_logs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert security logs" ON security_logs;
CREATE POLICY "Allow insert security logs" ON security_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 6. INSERT SAMPLE SECURITY LOGS
-- ============================================

-- Log keluar untuk permohonan yang approved
INSERT INTO security_logs (student_id, student_name, action, timestamp, security_officer, application_id)
VALUES 
  ('KV2024002', 'Pelajar 2', 'exit', NOW() - INTERVAL '2 hours', 'Pengawal Keselamatan', '20240113005');

-- ============================================
-- 7. CREATE ANNOUNCEMENTS TABLE (jika belum ada)
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'urgent', 'success')),
  created_by TEXT NOT NULL,
  creator_role TEXT NOT NULL CHECK (creator_role IN ('hep', 'warden', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add title if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='title') THEN
    ALTER TABLE announcements ADD COLUMN title TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add content if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='content') THEN
    ALTER TABLE announcements ADD COLUMN content TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='type') THEN
    ALTER TABLE announcements ADD COLUMN type TEXT NOT NULL DEFAULT 'info';
    ALTER TABLE announcements ADD CONSTRAINT announcements_type_check 
      CHECK (type IN ('info', 'warning', 'urgent', 'success'));
  END IF;

  -- Add created_by if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='created_by') THEN
    ALTER TABLE announcements ADD COLUMN created_by TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add creator_role if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='creator_role') THEN
    ALTER TABLE announcements ADD COLUMN creator_role TEXT NOT NULL DEFAULT 'admin';
    ALTER TABLE announcements ADD CONSTRAINT announcements_creator_role_check 
      CHECK (creator_role IN ('hep', 'warden', 'admin'));
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='created_at') THEN
    ALTER TABLE announcements ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add is_active if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='announcements' AND column_name='is_active') THEN
    ALTER TABLE announcements ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow read all announcements" ON announcements;
CREATE POLICY "Allow read all announcements" ON announcements
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert announcements" ON announcements;
CREATE POLICY "Allow insert announcements" ON announcements
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update announcements" ON announcements;
CREATE POLICY "Allow update announcements" ON announcements
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 8. INSERT SAMPLE ANNOUNCEMENTS
-- ============================================

INSERT INTO announcements (title, content, type, created_by, creator_role, is_active, created_at)
VALUES 
  ('Penting: Peraturan Keluar Asrama', 'Sila pastikan semua permohonan keluar dihantar sekurang-kurangnya 2 hari sebelum tarikh keluar. Terima kasih.', 'info', 'Tuan Rahimi', 'hep', true, NOW() - INTERVAL '5 days'),
  ('Amaran: Cuaca Buruk', 'Disebabkan ramalan hujan lebat, semua aktiviti luar dibatalkan. Sila kekal di dalam asrama.', 'warning', 'Tuan Shah', 'warden', true, NOW() - INTERVAL '1 day'),
  ('Urgent: Mesyuarat Pelajar', 'Semua pelajar Tahun 1 SVM diminta hadir mesyuarat pada esok jam 2 petang di dewan.', 'urgent', 'Encik Muhammad Ihsan', 'admin', true, NOW() - INTERVAL '3 hours'),
  ('Kejayaan: Program Sukan Tahunan', 'Tahniah kepada semua peserta Program Sukan Tahunan 2024!', 'success', 'Tuan Rahimi', 'hep', true, NOW() - INTERVAL '7 days');

-- ============================================
-- Selesai! Data demo telah dimasukkan
-- ============================================
