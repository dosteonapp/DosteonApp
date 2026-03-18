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
('SPC-002', 'Knorr Chicken Cubes', 'Spices & Seasonings', 'Seasoning', 'pack (20 cubes)', 'High theft risk — count on receipt'),
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
('SPC-015', 'Mustard', 'Spices & Seasonings', 'Condiment', 'bottle (250ml)', 'Chronic stockout at ERI Rwanda — flag low stock early'),
('SPC-016', 'Cocoa Powder', 'Spices & Seasonings', 'Baking', 'bag (500g)', 'Chronic stockout at Milimani — flag low stock early'),
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
