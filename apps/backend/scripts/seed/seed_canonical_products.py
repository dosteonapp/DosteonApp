import asyncio
import os
import sys

sys.path.append(os.getcwd())
from app.db.prisma import db

SEED_DATA = [
    {"sku": "PRO-001", "name": "Chicken - Whole", "category": "Proteins", "subcategory": "Poultry", "unit": "kg"},
    {"sku": "PRO-002", "name": "Chicken - Drumstick", "category": "Proteins", "subcategory": "Poultry", "unit": "kg"},
    {"sku": "PRO-003", "name": "Chicken - Breast", "category": "Proteins", "subcategory": "Poultry", "unit": "kg"},
    {"sku": "PRO-004", "name": "Chicken - Wings", "category": "Proteins", "subcategory": "Poultry", "unit": "kg"},
    {"sku": "PRO-005", "name": "Beef - Stewing Cuts", "category": "Proteins", "subcategory": "Beef", "unit": "kg"},
    {"sku": "PRO-006", "name": "Beef - Minced", "category": "Proteins", "subcategory": "Beef", "unit": "kg"},
    {"sku": "PRO-007", "name": "Beef - Liver", "category": "Proteins", "subcategory": "Beef", "unit": "kg"},
    {"sku": "PRO-008", "name": "Goat Meat", "category": "Proteins", "subcategory": "Goat", "unit": "kg"},
    {"sku": "PRO-009", "name": "Tilapia - Whole", "category": "Proteins", "subcategory": "Fish", "unit": "kg"},
    {"sku": "PRO-010", "name": "Tilapia - Fillet", "category": "Proteins", "subcategory": "Fish", "unit": "kg"},
    {"sku": "PRO-011", "name": "Eggs", "category": "Proteins", "subcategory": "Eggs", "unit": "tray (30)"},
    {"sku": "PRO-012", "name": "Sardines - Canned", "category": "Proteins", "subcategory": "Canned", "unit": "can (425g)"},
    {"sku": "PRO-013", "name": "Tuna - Canned", "category": "Proteins", "subcategory": "Canned", "unit": "can (185g)"},
    {"sku": "PRO-014", "name": "Tomatoes", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-015", "name": "Red Onions", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-016", "name": "Garlic", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-017", "name": "Ginger", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-018", "name": "Cabbage", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "head"},
    {"sku": "PRO-019", "name": "Carrots", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-020", "name": "Spinach", "category": "Fresh Produce", "subcategory": "Leafy Greens", "unit": "bunch"},
    {"sku": "PRO-021", "name": "Bell Peppers", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-022", "name": "Hot Peppers - Fresh", "category": "Fresh Produce", "subcategory": "Vegetables", "unit": "kg"},
    {"sku": "PRO-023", "name": "Irish Potatoes", "category": "Fresh Produce", "subcategory": "Tubers", "unit": "kg"},
    {"sku": "PRO-024", "name": "Sweet Potatoes", "category": "Fresh Produce", "subcategory": "Tubers", "unit": "kg"},
    {"sku": "PRO-025", "name": "Avocado", "category": "Fresh Produce", "subcategory": "Fruits", "unit": "piece"},
    {"sku": "PRO-026", "name": "Lemons", "category": "Fresh Produce", "subcategory": "Fruits", "unit": "piece"},
    {"sku": "PRO-027", "name": "Matoke / Green Banana", "category": "Fresh Produce", "subcategory": "Fruits", "unit": "bunch"},
    {"sku": "GRN-001", "name": "Rice - White Long Grain", "category": "Grains & Staples", "subcategory": "Rice", "unit": "kg"},
    {"sku": "GRN-002", "name": "Wheat Flour", "category": "Grains & Staples", "subcategory": "Flour", "unit": "kg"},
    {"sku": "GRN-003", "name": "Maize Flour", "category": "Grains & Staples", "subcategory": "Flour", "unit": "kg"},
    {"sku": "GRN-004", "name": "Spaghetti", "category": "Grains & Staples", "subcategory": "Pasta", "unit": "pack (500g)"},
    {"sku": "GRN-005", "name": "White Bread Loaf", "category": "Grains & Staples", "subcategory": "Bread", "unit": "loaf"},
    {"sku": "GRN-006", "name": "Kidney Beans", "category": "Grains & Staples", "subcategory": "Legumes", "unit": "kg"},
    {"sku": "GRN-007", "name": "Lentils", "category": "Grains & Staples", "subcategory": "Legumes", "unit": "kg"},
    {"sku": "GRN-008", "name": "Cassava Flour", "category": "Grains & Staples", "subcategory": "Flour", "unit": "kg"},
    {"sku": "SPC-001", "name": "Salt - Iodized", "category": "Spices & Seasonings", "subcategory": "Seasoning", "unit": "kg"},
    {"sku": "SPC-002", "name": "Knorr Chicken Cubes", "category": "Spices & Seasonings", "subcategory": "Seasoning", "unit": "pack (20 cubes)"},
    {"sku": "SPC-003", "name": "Royco", "category": "Spices & Seasonings", "subcategory": "Seasoning", "unit": "sachet (100g)"},
    {"sku": "SPC-004", "name": "Black Pepper - Ground", "category": "Spices & Seasonings", "subcategory": "Spice", "unit": "jar (50g)"},
    {"sku": "SPC-005", "name": "Paprika", "category": "Spices & Seasonings", "subcategory": "Spice", "unit": "jar (50g)"},
    {"sku": "SPC-006", "name": "Dried Pili-Pili", "category": "Spices & Seasonings", "subcategory": "Spice", "unit": "bag (100g)"},
    {"sku": "SPC-007", "name": "Curry Powder", "category": "Spices & Seasonings", "subcategory": "Spice", "unit": "jar (100g)"},
    {"sku": "SPC-008", "name": "Cinnamon", "category": "Spices & Seasonings", "subcategory": "Spice", "unit": "jar (50g)"},
    {"sku": "SPC-009", "name": "Tomato Paste - Canned", "category": "Spices & Seasonings", "subcategory": "Condiment", "unit": "can (400g)"},
    {"sku": "SPC-010", "name": "Ketchup", "category": "Spices & Seasonings", "subcategory": "Condiment", "unit": "bottle (500ml)"},
    {"sku": "SPC-011", "name": "Soy Sauce", "category": "Spices & Seasonings", "subcategory": "Condiment", "unit": "bottle (150ml)"},
    {"sku": "SPC-012", "name": "Vinegar", "category": "Spices & Seasonings", "subcategory": "Condiment", "unit": "bottle (500ml)"},
    {"sku": "SPC-013", "name": "Sugar - White", "category": "Spices & Seasonings", "subcategory": "Seasoning", "unit": "kg"},
    {"sku": "SPC-014", "name": "Honey", "category": "Spices & Seasonings", "subcategory": "Condiment", "unit": "bottle (500ml)"},
    {"sku": "SPC-015", "name": "Mustard", "category": "Spices & Seasonings", "subcategory": "Condiment", "unit": "bottle (250ml)"},
    {"sku": "SPC-016", "name": "Cocoa Powder", "category": "Spices & Seasonings", "subcategory": "Baking", "unit": "bag (500g)"},
    {"sku": "SPC-017", "name": "Vanilla Essence", "category": "Spices & Seasonings", "subcategory": "Baking", "unit": "bottle (100ml)"},
    {"sku": "SPC-018", "name": "Baking Powder", "category": "Spices & Seasonings", "subcategory": "Baking", "unit": "tin (100g)"},
    {"sku": "SPC-019", "name": "Yeast - Dry", "category": "Spices & Seasonings", "subcategory": "Baking", "unit": "sachet (11g)"},
    {"sku": "OIL-001", "name": "Cooking Oil - Vegetable", "category": "Oils & Fats", "subcategory": "Cooking Oil", "unit": "litre"},
    {"sku": "OIL-002", "name": "Palm Oil", "category": "Oils & Fats", "subcategory": "Cooking Oil", "unit": "litre"},
    {"sku": "OIL-003", "name": "Butter", "category": "Oils & Fats", "subcategory": "Dairy Fat", "unit": "block (250g)"},
    {"sku": "OIL-004", "name": "Blue Band Margarine", "category": "Oils & Fats", "subcategory": "Dairy Fat", "unit": "tub (500g)"},
]

async def main():
    await db.connect()
    try:
        print(f"Starting seed of {len(SEED_DATA)} SKUs...")
        for item in SEED_DATA:
            await db.canonicalproduct.upsert(
                where={"sku": item["sku"]},
                data={
                    "create": {
                        "sku": item["sku"],
                        "name": item["name"],
                        "category": item["category"],
                        "subcategory": item.get("subcategory"),
                        "base_unit": item["unit"],
                        "is_public": True,
                        "product_type": "inventory_item"
                    },
                    "update": {
                        "name": item["name"],
                        "category": item["category"],
                        "subcategory": item.get("subcategory"),
                        "base_unit": item["unit"],
                    }
                }
            )
        print("✅ Seed completed successfully!")
    finally:
        await db.disconnect()

asyncio.run(main())
