-- Add status field to pharmacy_profiles table
ALTER TABLE pharmacy_profiles
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN pharmacy_profiles.is_open IS 'Indicates if pharmacy is currently open (true) or closed (false)';

-- Update existing pharmacies to be open by default
UPDATE pharmacy_profiles SET is_open = true WHERE is_open IS NULL;
