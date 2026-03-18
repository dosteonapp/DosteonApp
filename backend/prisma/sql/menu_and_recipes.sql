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
