/*
  # Create vocabulary table

  1. New Tables
    - `vocabulary`
      - `id` (uuid, primary key)
      - `german` (text, required)
      - `french` (text, required)
      - `type` (text, required) - enum: noun, verb, adjective, adverb, phrase, quote
      - `gender` (text) - enum: M, F, N (for nouns only)
      - `plural` (text) - for nouns only
      - `proficiency` (text, required) - enum: unknown, learning, almost, mastered
      - `last_reviewed` (timestamp with time zone)
      - `next_review` (timestamp with time zone)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `vocabulary` table
    - Add policies for authenticated users to:
      - Read their own vocabulary entries
      - Create new entries
      - Update their entries
*/

-- Create enum types
CREATE TYPE word_type AS ENUM ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'quote');
CREATE TYPE gender_type AS ENUM ('M', 'F', 'N');
CREATE TYPE proficiency_level AS ENUM ('unknown', 'learning', 'almost', 'mastered');

-- Create vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  german text NOT NULL,
  french text NOT NULL,
  type word_type NOT NULL,
  gender gender_type,
  plural text,
  proficiency proficiency_level NOT NULL DEFAULT 'unknown',
  last_reviewed timestamptz NOT NULL DEFAULT now(),
  next_review timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own vocabulary"
  ON vocabulary
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary"
  ON vocabulary
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary"
  ON vocabulary
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX vocabulary_user_id_idx ON vocabulary(user_id);
CREATE INDEX vocabulary_type_idx ON vocabulary(type);
CREATE INDEX vocabulary_proficiency_idx ON vocabulary(proficiency);
CREATE INDEX vocabulary_next_review_idx ON vocabulary(next_review);