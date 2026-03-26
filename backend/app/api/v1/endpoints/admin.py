from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.api.deps import require_admin_key
from app.db.repositories.inventory_repository import inventory_repo
from app.db.prisma import db

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/products/pending", dependencies=[Depends(require_admin_key)])
async def list_pending_products():
    """Return all user-created products awaiting admin promotion to the global catalog."""
    return await inventory_repo.get_pending_review_products()


@router.post("/products/{product_id}/approve", dependencies=[Depends(require_admin_key)])
async def approve_product(product_id: str):
    """Approve a pending product: make its canonical public and clear the review flag."""
    product = await db.contextualproduct.find_unique(
        where={"id": product_id},
        include={"canonical": True},
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Promote the backing CanonicalProduct to the public catalog
    await db.canonicalproduct.update(
        where={"id": product.canonical_product_id},
        data={"is_public": True},
    )
    # Clear the pending flag on the contextual product
    await db.contextualproduct.update(
        where={"id": product_id},
        data={"pending_canonical_review": False},
    )
    return {"status": "approved", "product_id": product_id}


@router.post("/products/{product_id}/reject", dependencies=[Depends(require_admin_key)])
async def reject_product(product_id: str):
    """Reject a pending product: clear the review flag without promoting to catalog."""
    existing = await db.contextualproduct.find_unique(where={"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.contextualproduct.update(
        where={"id": product_id},
        data={"pending_canonical_review": False},
    )
    return {"status": "rejected", "product_id": product_id}


# ── Global Canonical Catalog ──────────────────────────────────────────────────

@router.get("/catalog", dependencies=[Depends(require_admin_key)])
async def list_catalog(
    search: Optional[str] = Query(None),
    public_only: bool = Query(False),
):
    """Return all canonical products (the global catalog)."""
    where: dict = {}
    if public_only:
        where["is_public"] = True
    if search:
        where["OR"] = [
            {"name": {"contains": search, "mode": "insensitive"}},
            {"sku": {"contains": search, "mode": "insensitive"}},
            {"category": {"contains": search, "mode": "insensitive"}},
        ]

    products = await db.canonicalproduct.find_many(
        where=where,
        order={"name": "asc"},
    )
    return [
        {
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "category": p.category,
            "subcategory": p.subcategory,
            "product_type": p.product_type,
            "base_unit": p.base_unit,
            "is_public": p.is_public,
            "is_critical_item": p.is_critical_item,
            "synonyms": p.synonyms,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        }
        for p in products
    ]


@router.patch("/catalog/{canonical_id}", dependencies=[Depends(require_admin_key)])
async def update_catalog_product(canonical_id: str, payload: dict):
    """Update a canonical product.

    Allowed fields: name, category, subcategory, base_unit,
                    is_public, is_critical_item, synonyms, product_type.

    Changes are immediately visible to all users whose ContextualProducts
    reference this canonical (the frontend always reads from the canonical
    relation at query time).
    """
    existing = await db.canonicalproduct.find_unique(where={"id": canonical_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Canonical product not found")

    ALLOWED = {
        "name", "category", "subcategory", "base_unit",
        "is_public", "is_critical_item", "synonyms", "product_type",
    }
    update_data = {k: v for k, v in payload.items() if k in ALLOWED}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    updated = await db.canonicalproduct.update(
        where={"id": canonical_id},
        data=update_data,
    )
    return {
        "id": updated.id,
        "sku": updated.sku,
        "name": updated.name,
        "category": updated.category,
        "subcategory": updated.subcategory,
        "product_type": updated.product_type,
        "base_unit": updated.base_unit,
        "is_public": updated.is_public,
        "is_critical_item": updated.is_critical_item,
        "synonyms": updated.synonyms,
        "updated_at": updated.updated_at,
    }
