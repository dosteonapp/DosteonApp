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
