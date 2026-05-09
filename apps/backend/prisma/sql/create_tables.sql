-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category JSONB,
    currentStock NUMERIC DEFAULT 0,
    minimumLevel NUMERIC DEFAULT 0,
    unit TEXT,
    branded TEXT,
    brandName TEXT,
    storageLocation TEXT,
    expiryDate TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Inventory Policies
CREATE POLICY "Users can view their own inventory" ON inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory" ON inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" ON inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" ON inventory
    FOR DELETE USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can view their own orders (as buyer or supplier)" ON orders
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = supplier_id);

CREATE POLICY "Buyers can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = supplier_id);
