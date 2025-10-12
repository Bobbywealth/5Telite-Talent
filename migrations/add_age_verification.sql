-- Add age verification fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_over_18 BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR;

-- Add comment explaining the columns
COMMENT ON COLUMN users.is_over_18 IS 'Indicates if user is 18 years or older';
COMMENT ON COLUMN users.guardian_phone IS 'Parent/guardian phone number for users under 18';

