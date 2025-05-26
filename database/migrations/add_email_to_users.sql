-- Add email column to users table
ALTER TABLE users
ADD COLUMN email VARCHAR(100) UNIQUE NOT NULL AFTER username;

-- Update existing users with default email based on username
UPDATE users 
SET email = CONCAT(username, '@example.com')
WHERE email IS NULL; 