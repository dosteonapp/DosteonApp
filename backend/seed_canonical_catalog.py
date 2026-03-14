import os
from app.core.supabase import supabase
from dotenv import load_dotenv

load_dotenv()

def seed_canonical_catalog():
    print("Seeding Canonical Catalog...")

    # Define the catalog data
    catalog_data = [
        # PROTEINS
        {"sku_id": "PRO-001", "canonical_name_en": "Chicken - Whole", "kinyarwanda_alias": "Inkoko yose", "category": "Proteins", "subcategory": "Poultry", "purchase_unit": "kg", "notes": "Primary supplier: PEAL"},
        {"sku_id": "PRO-002", "canonical_name_en": "Chicken - Drumstick", "kinyarwanda_alias": "Amaguru y'inkoko", "category": "Proteins", "subcategory": "Poultry", "purchase_unit": "kg", "notes": "Primary supplier: PEAL"},
        {"sku_id": "PRO-003", "canonical_name_en": "Chicken - Breast", "kinyarwanda_alias": "Isugudi ry'inkoko", "category": "Proteins", "subcategory": "Poultry", "purchase_unit": "kg", "notes": "Primary supplier: PEAL"},
        {"sku_id": "PRO-004", "canonical_name_en": "Chicken - Wings", "kinyarwanda_alias": "Amababa y'inkoko", "category": "Proteins", "subcategory": "Poultry", "purchase_unit": "kg", "notes": "Primary supplier: PEAL"},
        {"sku_id": "PRO-005", "canonical_name_en": "Beef - Stewing Cuts", "kinyarwanda_alias": "Inyama y'inka", "category": "Proteins", "subcategory": "Beef", "purchase_unit": "kg", "notes": None},
        {"sku_id": "PRO-006", "canonical_name_en": "Beef - Minced", "kinyarwanda_alias": "viande", "category": "Proteins", "subcategory": "Beef", "purchase_unit": "kg", "notes": None},
        {"sku_id": "PRO-007", "canonical_name_en": "Beef - Liver", "kinyarwanda_alias": "Imifu y'inka", "category": "Proteins", "subcategory": "Beef", "purchase_unit": "kg", "notes": None},
        {"sku_id": "PRO-008", "canonical_name_en": "Goat Meat", "kinyarwanda_alias": "Inyama y'ihene", "category": "Proteins", "subcategory": "Goat", "purchase_unit": "kg", "notes": None},
        {"sku_id": "PRO-009", "canonical_name_en": "Tilapia - Whole", "kinyarwanda_alias": "Tilapia yose", "category": "Proteins", "subcategory": "Fish", "purchase_unit": "kg", "notes": None},
        {"sku_id": "PRO-010", "canonical_name_en": "Tilapia - Fillet", "kinyarwanda_alias": "Tilapia isize", "category": "Proteins", "subcategory": "Fish", "purchase_unit": "kg", "notes": None},
        {"sku_id": "PRO-011", "canonical_name_en": "Eggs", "kinyarwanda_alias": "Amagi", "category": "Proteins", "subcategory": "Eggs", "purchase_unit": "tray (30)", "notes": "Log breakage separately as waste"},
        {"sku_id": "PRO-012", "canonical_name_en": "Sardines - Canned", "kinyarwanda_alias": "Sardine muri bo\u00eete", "category": "Proteins", "subcategory": "Canned", "purchase_unit": "can (425g)", "notes": "Supplier: ERI Rwanda / BM Azmarino"},
        {"sku_id": "PRO-013", "canonical_name_en": "Tuna - Canned", "kinyarwanda_alias": "Tuna muri bo\u00eete", "category": "Proteins", "subcategory": "Canned", "purchase_unit": "can (185g)", "notes": "Supplier: ERI Rwanda / BM Azmarino"},

        # FRESH PRODUCE
        {"sku_id": "PRO-014", "canonical_name_en": "Tomatoes", "kinyarwanda_alias": "Inyanya", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-015", "canonical_name_en": "Red Onions", "kinyarwanda_alias": "Igitunguru cyumutuku", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-016", "canonical_name_en": "Garlic", "kinyarwanda_alias": "Igitunguru cyumweru", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-017", "canonical_name_en": "Ginger", "kinyarwanda_alias": "Tangawizi", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-018", "canonical_name_en": "Cabbage", "kinyarwanda_alias": "Ishu", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "head", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-019", "canonical_name_en": "Carrots", "kinyarwanda_alias": "Karoti", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-020", "canonical_name_en": "Spinach", "kinyarwanda_alias": "Imbwija", "category": "Fresh Produce", "subcategory": "Leafy Greens", "purchase_unit": "bunch", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-021", "canonical_name_en": "Bell Peppers", "kinyarwanda_alias": "Pilipili nziza", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-022", "canonical_name_en": "Hot Peppers - Fresh", "kinyarwanda_alias": "Pilipili", "category": "Fresh Produce", "subcategory": "Vegetables", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-023", "canonical_name_en": "Irish Potatoes", "kinyarwanda_alias": "Ibirayi", "category": "Fresh Produce", "subcategory": "Tubers", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-024", "canonical_name_en": "Sweet Potatoes", "kinyarwanda_alias": "Ibijumba", "category": "Fresh Produce", "subcategory": "Tubers", "purchase_unit": "kg", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-025", "canonical_name_en": "Avocado", "kinyarwanda_alias": "Avoka", "category": "Fresh Produce", "subcategory": "Fruits", "purchase_unit": "piece", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-026", "canonical_name_en": "Lemons", "kinyarwanda_alias": "Indimu", "category": "Fresh Produce", "subcategory": "Fruits", "purchase_unit": "piece", "notes": "Sourced: Kimironko market"},
        {"sku_id": "PRO-027", "canonical_name_en": "Matoke / Green Banana", "kinyarwanda_alias": "Igitoki", "category": "Fresh Produce", "subcategory": "Fruits", "purchase_unit": "bunch", "notes": "Sourced: Kimironko market"},

        # GRAINS & STAPLES
        {"sku_id": "GRN-001", "canonical_name_en": "Rice - White Long Grain", "kinyarwanda_alias": "Umuceri", "category": "Grains & Staples", "subcategory": "Rice", "purchase_unit": "kg", "notes": None},
        {"sku_id": "GRN-002", "canonical_name_en": "Wheat Flour", "kinyarwanda_alias": "Ufu w'ingano", "category": "Grains & Staples", "subcategory": "Flour", "purchase_unit": "kg", "notes": "Brand: Azam"},
        {"sku_id": "GRN-003", "canonical_name_en": "Maize Flour", "kinyarwanda_alias": "Ufu wa Ibigori", "category": "Grains & Staples", "subcategory": "Flour", "purchase_unit": "kg", "notes": None},
        {"sku_id": "GRN-004", "canonical_name_en": "Spaghetti", "kinyarwanda_alias": "Macaroni / Spaghetti", "category": "Grains & Staples", "subcategory": "Pasta", "purchase_unit": "pack (500g)", "notes": None},
        {"sku_id": "GRN-005", "canonical_name_en": "White Bread Loaf", "kinyarwanda_alias": "Umugati", "category": "Grains & Staples", "subcategory": "Bread", "purchase_unit": "loaf", "notes": None},
        {"sku_id": "GRN-006", "canonical_name_en": "Kidney Beans", "kinyarwanda_alias": "Ibiharage", "category": "Grains & Staples", "subcategory": "Legumes", "purchase_unit": "kg", "notes": None},
        {"sku_id": "GRN-007", "canonical_name_en": "Lentils", "kinyarwanda_alias": "Amashaza", "category": "Grains & Staples", "subcategory": "Legumes", "purchase_unit": "kg", "notes": None},
        {"sku_id": "GRN-008", "canonical_name_en": "Cassava Flour", "kinyarwanda_alias": "Ufu y'imyumbati", "category": "Grains & Staples", "subcategory": "Flour", "purchase_unit": "kg", "notes": None},

        # SPICES & SEASONINGS
        {"sku_id": "SPC-001", "canonical_name_en": "Salt - Iodized", "kinyarwanda_alias": "Umunyu", "category": "Spices & Seasonings", "subcategory": "Seasoning", "purchase_unit": "kg", "notes": None},
        {"sku_id": "SPC-002", "canonical_name_en": "Knorr Chicken Cubes", "kinyarwanda_alias": "Knorr / Bouillon", "category": "Spices & Seasonings", "subcategory": "Seasoning", "purchase_unit": "pack (20 cubes)", "notes": "High theft risk \u2014 count on receipt"},
        {"sku_id": "SPC-003", "canonical_name_en": "Royco", "kinyarwanda_alias": "Royco", "category": "Spices & Seasonings", "subcategory": "Seasoning", "purchase_unit": "sachet (100g)", "notes": None},
        {"sku_id": "SPC-004", "canonical_name_en": "Black Pepper - Ground", "kinyarwanda_alias": "Poivre noir", "category": "Spices & Seasonings", "subcategory": "Spice", "purchase_unit": "jar (50g)", "notes": None},
        {"sku_id": "SPC-005", "canonical_name_en": "Paprika", "kinyarwanda_alias": "Paprika", "category": "Spices & Seasonings", "subcategory": "Spice", "purchase_unit": "jar (50g)", "notes": None},
        {"sku_id": "SPC-006", "canonical_name_en": "Dried Pili-Pili", "kinyarwanda_alias": "Pilipili yumye", "category": "Spices & Seasonings", "subcategory": "Spice", "purchase_unit": "bag (100g)", "notes": None},
        {"sku_id": "SPC-007", "canonical_name_en": "Curry Powder", "kinyarwanda_alias": "Curry", "category": "Spices & Seasonings", "subcategory": "Spice", "purchase_unit": "jar (100g)", "notes": None},
        {"sku_id": "SPC-008", "canonical_name_en": "Cinnamon", "kinyarwanda_alias": "Cannelle", "category": "Spices & Seasonings", "subcategory": "Spice", "purchase_unit": "jar (50g)", "notes": None},
        {"sku_id": "SPC-009", "canonical_name_en": "Tomato Paste - Canned", "kinyarwanda_alias": "P\u00e2te de tomate", "category": "Spices & Seasonings", "subcategory": "Condiment", "purchase_unit": "can (400g)", "notes": "Supplier: ERI Rwanda"},
        {"sku_id": "SPC-010", "canonical_name_en": "Ketchup", "kinyarwanda_alias": "Ketchup", "category": "Spices & Seasonings", "subcategory": "Condiment", "purchase_unit": "bottle (500ml)", "notes": None},
        {"sku_id": "SPC-011", "canonical_name_en": "Soy Sauce", "kinyarwanda_alias": "Soja", "category": "Spices & Seasonings", "subcategory": "Condiment", "purchase_unit": "bottle (150ml)", "notes": None},
        {"sku_id": "SPC-012", "canonical_name_en": "Vinegar", "kinyarwanda_alias": "Vinaigre", "category": "Spices & Seasonings", "subcategory": "Condiment", "purchase_unit": "bottle (500ml)", "notes": None},
        {"sku_id": "SPC-013", "canonical_name_en": "Sugar - White", "kinyarwanda_alias": "Isukari", "category": "Spices & Seasonings", "subcategory": "Seasoning", "purchase_unit": "kg", "notes": None},
        {"sku_id": "SPC-014", "canonical_name_en": "Honey", "kinyarwanda_alias": "Ubuki", "category": "Spices & Seasonings", "subcategory": "Condiment", "purchase_unit": "bottle (500ml)", "notes": None},
        {"sku_id": "SPC-015", "canonical_name_en": "Mustard", "kinyarwanda_alias": "Moutarde", "category": "Spices & Seasonings", "subcategory": "Condiment", "purchase_unit": "bottle (250ml)", "notes": "Chronic stockout at ERI Rwanda \u2014 flag low stock early"},
        {"sku_id": "SPC-016", "canonical_name_en": "Cocoa Powder", "kinyarwanda_alias": "Poda ya Cacao", "category": "Spices & Seasonings", "subcategory": "Baking", "purchase_unit": "bag (500g)", "notes": "Chronic stockout at Milimani \u2014 flag low stock early"},
        {"sku_id": "SPC-017", "canonical_name_en": "Vanilla Essence", "kinyarwanda_alias": "Vanilla", "category": "Spices & Seasonings", "subcategory": "Baking", "purchase_unit": "bottle (100ml)", "notes": None},
        {"sku_id": "SPC-018", "canonical_name_en": "Baking Powder", "kinyarwanda_alias": "Leavure chimique", "category": "Spices & Seasonings", "subcategory": "Baking", "purchase_unit": "tin (100g)", "notes": None},
        {"sku_id": "SPC-019", "canonical_name_en": "Yeast - Dry", "kinyarwanda_alias": "Levure", "category": "Spices & Seasonings", "subcategory": "Baking", "purchase_unit": "sachet (11g)", "notes": None},

        # OILS & FATS
        {"sku_id": "OIL-001", "canonical_name_en": "Cooking Oil - Vegetable", "kinyarwanda_alias": "Amavuta", "category": "Oils & Fats", "subcategory": "Cooking Oil", "purchase_unit": "litre", "notes": "Buy in 20L jerrican, log in litres"},
        {"sku_id": "OIL-002", "canonical_name_en": "Palm Oil", "kinyarwanda_alias": "Amavuta ya Palme", "category": "Oils & Fats", "subcategory": "Cooking Oil", "purchase_unit": "litre", "notes": None},
        {"sku_id": "OIL-003", "canonical_name_en": "Butter", "kinyarwanda_alias": "Beurre", "category": "Oils & Fats", "subcategory": "Dairy Fat", "purchase_unit": "block (250g)", "notes": None},
        {"sku_id": "OIL-004", "canonical_name_en": "Blue Band Margarine", "kinyarwanda_alias": "Margarine", "category": "Oils & Fats", "subcategory": "Dairy Fat", "purchase_unit": "tub (500g)", "notes": None}
    ]

    for item in catalog_data:
        try:
            # Check if it exists
            res = supabase.table("canonical_catalog").select("id").eq("sku_id", item["sku_id"]).execute()
            if res.data:
                # Update
                supabase.table("canonical_catalog").update(item).eq("sku_id", item["sku_id"]).execute()
                print(f"Updated: {item['sku_id']}")
            else:
                # Insert
                supabase.table("canonical_catalog").insert(item).execute()
                print(f"Inserted: {item['sku_id']}")
        except Exception as e:
            print(f"Error for {item['sku_id']}: {e}")
            # If the table doesn't exist, we must run the SQL first.
            if "relation \"public.canonical_catalog\" does not exist" in str(e):
                print("\n\u274c ERROR: You must run backend/canonical_catalog.sql in the Supabase SQL Editor first!")
                return

    print("Seeding complete.")

if __name__ == "__main__":
    seed_canonical_catalog()
