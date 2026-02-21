-- Create the storage bucket for ordre de mission PDFs and documents (required for PDF URLs to work).
-- Run this in Supabase SQL Editor if the bucket is missing (404 Bucket not found).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT
  gen_random_uuid(),
  'documents-ordre-mission',
  true,
  52428800,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'documents-ordre-mission');
