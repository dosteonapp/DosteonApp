import asyncio, sys, os
sys.path.append(os.getcwd())
from app.db.prisma import db

ORG_ID      = "cc5e8d58-f217-40c3-b2a9-6a5366f24c5f"
LOCATION_ID = "060b1b4c-084a-4b69-91c8-06b57494de6a"

# SKUs to activate for your restaurant (subset of canonical products)
ITEMS = [
    {"sku": "PRO-001", "stock": 15.0, "reorder": 5.0, "critical": 2.0},
    {"sku": "PRO-003", "stock": 10.0, "reorder": 4.0, "critical": 1.0},
    {"sku": "PRO-011", "stock": 6.0,  "reorder": 2.0, "critical": 1.0},
    {"sku": "PRO-014", "stock": 20.0, "reorder": 5.0, "critical": 2.0},
    {"sku": "PRO-015", "stock": 10.0, "reorder": 3.0, "critical": 1.0},
    {"sku": "PRO-023", "stock": 25.0, "reorder": 8.0, "critical": 3.0},
    {"sku": "GRN-001", "stock": 30.0, "reorder": 10.0, "critical": 4.0},
    {"sku": "GRN-002", "stock": 20.0, "reorder": 5.0, "critical": 2.0},
    {"sku": "GRN-006", "stock": 15.0, "reorder": 5.0, "critical": 2.0},
    {"sku": "SPC-001", "stock": 5.0,  "reorder": 2.0, "critical": 0.5},
    {"sku": "SPC-009", "stock": 8.0,  "reorder": 3.0, "critical": 1.0},
    {"sku": "SPC-013", "stock": 10.0, "reorder": 3.0, "critical": 1.0},
    {"sku": "OIL-001", "stock": 12.0, "reorder": 4.0, "critical": 1.0},
    {"sku": "OIL-003", "stock": 4.0,  "reorder": 2.0, "critical": 0.5},
]

async def seed():
    await db.connect()
    try:
        created = 0
        for item in ITEMS:
            canonical = await db.canonicalproduct.find_unique(where={"sku": item["sku"]})
            if not canonical:
                print(f"  SKIP {item['sku']} - not found in canonical products")
                continue

            await db.contextualproduct.upsert(
                where={"id": "00000000-0000-0000-0000-000000000000"},  # force create path
                data={
                    "create": {
                        "canonical_product_id": canonical.id,
                        "organization_id": ORG_ID,
                        "location_id": LOCATION_ID,
                        "sku": canonical.sku,
                        "name": canonical.name,
                        "current_stock": item["stock"],
                        "reorder_threshold": item["reorder"],
                        "critical_threshold": item["critical"],
                        "preferred_unit": canonical.base_unit,
                        "status": "active",
                        "is_active": True,
                        "storage_type": "dry"
                    },
                    "update": {
                        "current_stock": item["stock"],
                        "reorder_threshold": item["reorder"],
                        "critical_threshold": item["critical"],
                    }
                }
            )
            created += 1
            print(f"  + {canonical.name}")

        print(f"\n✅ {created} inventory items seeded!")
    finally:
        await db.disconnect()

asyncio.run(seed())
