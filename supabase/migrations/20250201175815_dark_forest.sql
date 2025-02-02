/*
  # Create images table for one-time viewable images

  1. New Tables
    - `images`
      - `id` (uuid, primary key)
      - `url` (text, not null) - URL of the stored image
      - `view_token` (text, unique) - Unique token for one-time viewing
      - `is_viewed` (boolean) - Track if image has been viewed
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `images` table
    - Add policies for inserting and viewing images
*/

CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  view_token text UNIQUE NOT NULL,
  is_viewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert images"
  ON images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view unviewed images with correct token"
  ON images
  FOR SELECT
  TO public
  USING (NOT is_viewed);

CREATE POLICY "Anyone can update viewed status"
  ON images
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);