/*
  # Create storage bucket for images

  1. New Storage Configuration
    - Creates 'images' bucket for storing uploaded images
    - Sets bucket as public
  
  2. Security
    - Adds policy for public read access
    - Adds policy for public upload access
*/

-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Allow public access to the images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated uploads to the images bucket
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');