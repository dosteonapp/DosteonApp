-- ALL-IN-ONE LAYERED SCHEMA FOR DOSTEON MVP
-- Focus: Foundation + Layered Inventory & Kitchen Services

-- ==========================================
-- 0. FOUNDATION LAYER (Tenancy & Profiles)
-- ==========================================

-- Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'restaurant' NOT NULL,
    settings JSONB DEFAULT '{"opening_time": "08:00", "closing_time": "22:00"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('supplier', 'restaurant', 'admin', 'manager', 'staff')) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Link profiles to teams (Circular dependency fix)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_team') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_team 
        FOREIGN KEY (team_id) REFERENCES public.teams(id);
    END IF;
END $$;

-- ==========================================
-- 1. CANONICAL LAYER
-- "What exists in the world, independent of any business."
-- ==========================================
CREATE TABLE IF NOT EXISTS public.canonical_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    product_type TEXT NOT NULL,
    base_unit TEXT NOT NULL, -- e.g. kg, litre, piece
    is_critical_item BOOLEAN DEFAULT false,
    synonyms TEXT[], -- optional aliases / local names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Supporting: Locations
-- ==========================================
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    region TEXT,
    city TEXT,
    location_type TEXT NOT NULL, -- restaurant, warehouse, hub, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. CONTEXTUAL LAYER
-- "How a specific business experiences that product."
-- ==========================================
CREATE TABLE IF NOT EXISTS public.contextual_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_product_id UUID NOT NULL REFERENCES public.canonical_products(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL DEFAULT 'restaurant', -- restaurant | supplier

    brand_name TEXT,
    pack_size NUMERIC,
    pack_unit TEXT, -- kg, litre, piece
    preferred_unit TEXT, -- bag, sack, crate

    location_id UUID REFERENCES public.locations(id),
    reorder_threshold NUMERIC DEFAULT 0,
    storage_type TEXT, -- dry_store, cold_room, freezer

    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. EVENT LAYER (Immutable Ledger)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.inventory_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contextual_product_id UUID NOT NULL REFERENCES public.contextual_products(id) ON DELETE CASCADE,

    event_type TEXT NOT NULL, 
    -- opening_stock, consumption, delivery, adjustment, transfer, closing_stock

    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL, -- must be convertible to canonical base_unit

    source_location_id UUID REFERENCES public.locations(id),
    destination_location_id UUID REFERENCES public.locations(id),

    actor_type TEXT, -- user | system | supplier
    actor_id UUID,

    reference_id TEXT, -- invoice ID, delivery note, etc.
    metadata JSONB, -- extensibility without schema changes

    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Operational State: Day Control
-- ==========================================
CREATE TABLE IF NOT EXISTS public.day_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'CLOSED', 
    opening_time TIMESTAMP WITH TIME ZONE,
    closing_time TIMESTAMP WITH TIME ZONE,
    is_opening_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Conversions
-- ==========================================
CREATE TABLE IF NOT EXISTS public.unit_conversions (
    from_unit TEXT,
    to_unit TEXT,
    multiplier NUMERIC NOT NULL,
    PRIMARY KEY (from_unit, to_unit)
);

-- ==========================================
-- RLS CONFIGURATION
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contextual_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_status ENABLE ROW LEVEL SECURITY;

-- Helper function for organization check
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public Read for Canonical" ON public.canonical_products;
CREATE POLICY "Public Read for Canonical" ON public.canonical_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Org Access for Organizations" ON public.organizations;
CREATE POLICY "Org Access for Organizations" ON public.organizations FOR SELECT 
USING (id = public.get_my_org_id());

DROP POLICY IF EXISTS "Org Access for Locations" ON public.locations;
CREATE POLICY "Org Access for Locations" ON public.locations FOR ALL 
USING (organization_id = public.get_my_org_id());

DROP POLICY IF EXISTS "Org Access for Contextual" ON public.contextual_products;
CREATE POLICY "Org Access for Contextual" ON public.contextual_products FOR ALL 
USING (organization_id = public.get_my_org_id());

DROP POLICY IF EXISTS "Org Access for Events" ON public.inventory_events;
CREATE POLICY "Org Access for Events" ON public.inventory_events FOR ALL 
USING (contextual_product_id IN (
    SELECT id FROM public.contextual_products 
    WHERE organization_id = public.get_my_org_id()
));

DROP POLICY IF EXISTS "Org Access for Day Status" ON public.day_status;
CREATE POLICY "Org Access for Day Status" ON public.day_status FOR ALL 
USING (organization_id = public.get_my_org_id());

-- ==========================================
-- AUTH TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
