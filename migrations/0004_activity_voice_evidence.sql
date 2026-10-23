-- FindIt - Cloudflare D1 SQL Database Schema Migration (v4)
-- Add voice recording evidence and grade columns to activity_submissions table

ALTER TABLE activity_submissions ADD COLUMN audio_base64 TEXT;
ALTER TABLE activity_submissions ADD COLUMN audio_duration INTEGER;
ALTER TABLE activity_submissions ADD COLUMN user_grade TEXT;
