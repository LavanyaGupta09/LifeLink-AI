-- 1. Update user_profiles table with onboarding fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_onboarded boolean DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dob date;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS blood_group text;

-- 2. Ensure family_members table exists for emergency contacts
CREATE TABLE IF NOT EXISTS family_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for quick lookup of primary contacts
CREATE INDEX IF NOT EXISTS idx_family_members_patient ON family_members (patient_id);
