/*
  # Storage bucket and policies update
  
  1. Changes
    - Ensures storage bucket exists
    - Updates storage policies if they don't exist
  
  2. Security
    - Enables public access to images bucket
    - Allows public operations (select, insert, update, delete)
*/

-- Create a storage bucket for images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('images', 'images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Check and create select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'images');
  END IF;

  -- Check and create insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow uploads'
  ) THEN
    CREATE POLICY "Allow uploads"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'images');
  END IF;

  -- Check and create update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow updates'
  ) THEN
    CREATE POLICY "Allow updates"
    ON storage.objects FOR UPDATE
    TO public
    USING (bucket_id = 'images');
  END IF;

  -- Check and create delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow deletes'
  ) THEN
    CREATE POLICY "Allow deletes"
    ON storage.objects FOR DELETE
    TO public
    USING (bucket_id = 'images');
  END IF;
END $$;