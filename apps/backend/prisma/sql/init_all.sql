-- ALL-IN-ONE SQL FOR DOSTEON PHASE 1-2
-- Run this in your Supabase SQL Editor

-- 1. Create Profiles (Core)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text NOT NULL,
  role text CHECK (role IN ('supplier', 'restaurant', 'admin', 'manager', 'staff')) NOT NULL,
  first_name text,
  last_name text,
  organization_id uuid,
  team_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'restaurant' NOT NULL,
    settings JSONB DEFAULT '{"opening_time": "08:00", "closing_time": "22:00"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Link profiles to organizations
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_organization') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_organization 
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id);
    END IF;
END $$;

-- 3. Create Teams
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Link profiles to teams
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_team') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_team 
        FOREIGN KEY (team_id) REFERENCES public.teams(id);
    END IF;
END $$;


-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 5. Create helper for RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 6. Create basic policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view org members" ON public.profiles
    FOR SELECT USING (organization_id = public.get_my_org_id());

CREATE POLICY "Organizations are viewable by members" ON public.organizations
    FOR SELECT USING (id = public.get_my_org_id());


-- 6. Auth Trigger to auto-create profile on signup
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
-- Phase 3: Core Inventory & Daily Lifecycle
-- Updating Inventory to be Multi-tenant by Organization

-- 1. Create inventory table (Replaces old 'inventory' if it existed)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    brand TEXT,
    unit TEXT DEFAULT 'unit' NOT NULL,
    current_stock NUMERIC DEFAULT 0 NOT NULL,
    min_level NUMERIC DEFAULT 0 NOT NULL,
    restock_point NUMERIC DEFAULT 0 NOT NULL,
    cost_per_unit NUMERIC DEFAULT 0 NOT NULL,
    image_url TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Day Lifecycle Status Table
CREATE TABLE IF NOT EXISTS public.day_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    state TEXT CHECK (state IN ('PRE_OPEN', 'OPEN', 'CLOSING_IN_PROGRESS', 'CLOSED')) DEFAULT 'CLOSED' NOT NULL,
    opening_time TIMESTAMP WITH TIME ZONE,
    closing_time TIMESTAMP WITH TIME ZONE,
    is_opening_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id)
);

-- 3. Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_status ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Inventory viewable by organization members" ON public.inventory_items
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Inventory editable by organization admins/managers" ON public.inventory_items
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ));

CREATE POLICY "Day status viewable by organization members" ON public.day_status
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Day status editable by organization admins/managers" ON public.day_status
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ));
-- Phase 4: Menu Items & Recipes (POS Integration)

-- 1. Create Menu Items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC DEFAULT 0 NOT NULL,
    category TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Recipes (Menu Item Ingredients) table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity_required NUMERIC NOT NULL, -- The amount of inventory item used per menu item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(menu_item_id, inventory_item_id)
);

-- 3. Create Sales Logs table
CREATE TABLE IF NOT EXISTS public.sales_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
    quantity_sold INTEGER DEFAULT 1 NOT NULL,
    sold_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Menu Items
CREATE POLICY "Menu Items viewable by anyone" ON public.menu_items
    FOR SELECT USING (true); -- Publicly viewable or restricted to organization? Let's say organization for now.

DROP POLICY IF EXISTS "Menu Items viewable by anyone" ON public.menu_items;
CREATE POLICY "Menu Items viewable by organization members" ON public.menu_items
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Menu Items editable by organization admins/managers" ON public.menu_items
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ));

-- Recipes (Linked to Menu Items)
CREATE POLICY "Recipes viewable by organization members" ON public.recipes
    FOR SELECT USING (menu_item_id IN (
        SELECT id FROM public.menu_items WHERE organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Recipes editable by organization admins/managers" ON public.recipes
    FOR ALL USING (menu_item_id IN (
        SELECT id FROM public.menu_items WHERE organization_id IN (
            SELECT organization_id FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    ));

-- Sales Logs
CREATE POLICY "Sales Logs viewable by organization members" ON public.sales_logs
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Sales Logs creation by anyone (POS simulation)" ON public.sales_logs
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));
-- Phase 5: Canonical Catalog
-- Global reference catalog for inventory items in Kigali, Rwanda

-- 1. Create the canonical catalog table
CREATE TABLE IF NOT EXISTS public.canonical_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id TEXT UNIQUE NOT NULL,
    canonical_name_en TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    purchase_unit TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS and add public read policy
ALTER TABLE public.canonical_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog is publicly viewable" ON public.canonical_catalog
    FOR SELECT USING (true);

-- 3. Insert the seed data
INSERT INTO public.canonical_catalog (sku_id, canonical_name_en, category, subcategory, purchase_unit, notes)
VALUES
-- PROTEINS
('PRO-001', 'Chicken - Whole', 'Proteins', 'Poultry', 'kg', 'Primary supplier: PEAL'),
('PRO-002', 'Chicken - Drumstick', 'Proteins', 'Poultry', 'kg', 'Primary supplier: PEAL'),
('PRO-003', 'Chicken - Breast', 'Proteins', 'Poultry', 'kg', 'Primary supplier: PEAL'),
('PRO-004', 'Chicken - Wings', 'Proteins', 'Poultry', 'kg', 'Primary supplier: PEAL'),
('PRO-005', 'Beef - Stewing Cuts', 'Proteins', 'Beef', 'kg', NULL),
('PRO-006', 'Beef - Minced', 'Proteins', 'Beef', 'kg', NULL),
('PRO-007', 'Beef - Liver', 'Proteins', 'Beef', 'kg', NULL),
('PRO-008', 'Goat Meat', 'Proteins', 'Goat', 'kg', NULL),
('PRO-009', 'Tilapia - Whole', 'Proteins', 'Fish', 'kg', NULL),
('PRO-010', 'Tilapia - Fillet', 'Proteins', 'Fish', 'kg', NULL),
('PRO-011', 'Eggs', 'Proteins', 'Eggs', 'tray (30)', 'Log breakage separately as waste'),
('PRO-012', 'Sardines - Canned', 'Proteins', 'Canned', 'can (425g)', 'Supplier: ERI Rwanda / BM Azmarino'),
('PRO-013', 'Tuna - Canned', 'Proteins', 'Canned', 'can (185g)', 'Supplier: ERI Rwanda / BM Azmarino'),

-- FRESH PRODUCE
('PRO-014', 'Tomatoes', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-015', 'Red Onions', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-016', 'Garlic', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-017', 'Ginger', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-018', 'Cabbage', 'Fresh Produce', 'Vegetables', 'head', 'Sourced: Kimironko market'),
('PRO-019', 'Carrots', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-020', 'Spinach', 'Fresh Produce', 'Leafy Greens', 'bunch', 'Sourced: Kimironko market'),
('PRO-021', 'Bell Peppers', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-022', 'Hot Peppers - Fresh', 'Fresh Produce', 'Vegetables', 'kg', 'Sourced: Kimironko market'),
('PRO-023', 'Irish Potatoes', 'Fresh Produce', 'Tubers', 'kg', 'Sourced: Kimironko market'),
('PRO-024', 'Sweet Potatoes', 'Fresh Produce', 'Tubers', 'kg', 'Sourced: Kimironko market'),
('PRO-025', 'Avocado', 'Fresh Produce', 'Fruits', 'piece', 'Sourced: Kimironko market'),
('PRO-026', 'Lemons', 'Fresh Produce', 'Fruits', 'piece', 'Sourced: Kimironko market'),
('PRO-027', 'Matoke / Green Banana', 'Fresh Produce', 'Fruits', 'bunch', 'Sourced: Kimironko market'),

-- GRAINS & STAPLES
('GRN-001', 'Rice - White Long Grain', 'Grains & Staples', 'Rice', 'kg', NULL),
('GRN-002', 'Wheat Flour', 'Grains & Staples', 'Flour', 'kg', 'Brand: Azam'),
('GRN-003', 'Maize Flour', 'Grains & Staples', 'Flour', 'kg', NULL),
('GRN-004', 'Spaghetti', 'Grains & Staples', 'Pasta', 'pack (500g)', NULL),
('GRN-005', 'White Bread Loaf', 'Grains & Staples', 'Bread', 'loaf', NULL),
('GRN-006', 'Kidney Beans', 'Grains & Staples', 'Legumes', 'kg', NULL),
('GRN-007', 'Lentils', 'Grains & Staples', 'Legumes', 'kg', NULL),
('GRN-008', 'Cassava Flour', 'Grains & Staples', 'Flour', 'kg', NULL),

-- SPICES & SEASONINGS
('SPC-001', 'Salt - Iodized', 'Spices & Seasonings', 'Seasoning', 'kg', NULL),
('SPC-002', 'Knorr Chicken Cubes', 'Spices & Seasonings', 'Seasoning', 'pack (20 cubes)', 'High theft risk â€” count on receipt'),
('SPC-003', 'Royco', 'Spices & Seasonings', 'Seasoning', 'sachet (100g)', NULL),
('SPC-004', 'Black Pepper - Ground', 'Spices & Seasonings', 'Spice', 'jar (50g)', NULL),
('SPC-005', 'Paprika', 'Spices & Seasonings', 'Spice', 'jar (50g)', NULL),
('SPC-006', 'Dried Pili-Pili', 'Spices & Seasonings', 'Spice', 'bag (100g)', NULL),
('SPC-007', 'Curry Powder', 'Spices & Seasonings', 'Spice', 'jar (100g)', NULL),
('SPC-008', 'Cinnamon', 'Spices & Seasonings', 'Spice', 'jar (50g)', NULL),
('SPC-009', 'Tomato Paste - Canned', 'Spices & Seasonings', 'Condiment', 'can (400g)', 'Supplier: ERI Rwanda'),
('SPC-010', 'Ketchup', 'Spices & Seasonings', 'Condiment', 'bottle (500ml)', NULL),
('SPC-011', 'Soy Sauce', 'Spices & Seasonings', 'Condiment', 'bottle (150ml)', NULL),
('SPC-012', 'Vinegar', 'Spices & Seasonings', 'Condiment', 'bottle (500ml)', NULL),
('SPC-013', 'Sugar - White', 'Spices & Seasonings', 'Seasoning', 'kg', NULL),
('SPC-014', 'Honey', 'Spices & Seasonings', 'Condiment', 'bottle (500ml)', NULL),
('SPC-015', 'Mustard', 'Spices & Seasonings', 'Condiment', 'bottle (250ml)', 'Chronic stockout at ERI Rwanda â€” flag low stock early'),
('SPC-016', 'Cocoa Powder', 'Spices & Seasonings', 'Baking', 'bag (500g)', 'Chronic stockout at Milimani â€” flag low stock early'),
('SPC-017', 'Vanilla Essence', 'Spices & Seasonings', 'Baking', 'bottle (100ml)', NULL),
('SPC-018', 'Baking Powder', 'Spices & Seasonings', 'Baking', 'tin (100g)', NULL),
('SPC-019', 'Yeast - Dry', 'Spices & Seasonings', 'Baking', 'sachet (11g)', NULL),

-- OILS & FATS
('OIL-001', 'Cooking Oil - Vegetable', 'Oils & Fats', 'Cooking Oil', 'litre', 'Buy in 20L jerrican, log in litres'),
('OIL-002', 'Palm Oil', 'Oils & Fats', 'Cooking Oil', 'litre', NULL),
('OIL-003', 'Butter', 'Oils & Fats', 'Dairy Fat', 'block (250g)', NULL),
('OIL-004', 'Blue Band Margarine', 'Oils & Fats', 'Dairy Fat', 'tub (500g)', NULL)
ON CONFLICT (sku_id) DO UPDATE SET
    canonical_name_en = EXCLUDED.canonical_name_en,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    purchase_unit = EXCLUDED.purchase_unit,
    notes = EXCLUDED.notes;
