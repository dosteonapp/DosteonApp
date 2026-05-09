-- Phase 1-2: Foundation Schema
-- Supporting Organizations, Teams, and RBAC

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'restaurant' NOT NULL,
    settings JSONB DEFAULT '{"opening_time": "08:00", "closing_time": "22:00"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Update Profiles Table (or recreate it if needed)
-- Assuming profiles already exists from supabase_schema.sql, we add columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organization_id') THEN
        ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='team_id') THEN
        ALTER TABLE profiles ADD COLUMN team_id UUID REFERENCES teams(id);
    END IF;

    -- Update role check constraint if it exists
    -- First drop the old one if it exists
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('supplier', 'restaurant', 'admin', 'manager', 'staff'));
END $$;

-- 4. RLS for Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- 5. RLS for Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view teams in their organization" ON teams
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- 6. Update Handle New User Trigger
-- We want to allow metadata to pass organization_id if it's an invite flow
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, organization_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    (new.raw_user_meta_data->>'organization_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
