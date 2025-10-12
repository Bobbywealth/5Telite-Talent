-- Add password reset fields to users table
-- Run this manually in your database if the deployment fails

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR,
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_password_token);

