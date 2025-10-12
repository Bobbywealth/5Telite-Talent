-- Add category column to bookings table if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS category VARCHAR;

-- Add comment explaining the column
COMMENT ON COLUMN bookings.category IS 'Optional category for booking classification';

