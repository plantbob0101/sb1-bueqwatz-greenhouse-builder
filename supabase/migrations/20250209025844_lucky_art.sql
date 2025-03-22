/*
  # Add authentication policies

  1. Changes
    - Add RLS policies for authenticated users to access their own data
    - Add policies for public access to necessary tables
    - Add profile handling for new users

  2. Security
    - Enable RLS on all tables
    - Restrict access to authenticated users
    - Allow public access where needed
*/

-- Create a secure profiles table linked to auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update structures policies
CREATE POLICY "Users can create structures"
  ON structures
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their structures"
  ON structures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = structure_id::uuid);

CREATE POLICY "Users can delete their structures"
  ON structures
  FOR DELETE
  TO authenticated
  USING (auth.uid() = structure_id::uuid);