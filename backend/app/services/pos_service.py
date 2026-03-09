from app.repositories.pos_repository import pos_repo
from app.repositories.inventory_repository import inventory_repo
from fastapi import HTTPException, status

class POSService:
    async def get_menu(self, organization_id: str):
        return pos_repo.get_menu_items(organization_id)

    async def place_order(self, organization_id: str, menu_item_id: str, quantity: int = 1):
        # 1. Fetch the recipe for the menu item
        recipe = pos_repo.get_recipe(menu_item_id)
        if not recipe:
            # If no recipe is defined, we just log the sale without inventory deduction
            # or we could raise an error. Let's just log for now.
            pos_repo.log_sale(organization_id, menu_item_id, quantity)
            return {"status": "success", "deduction": "none"}

        # 2. Check if we have enough stock (Optional but good)
        for ingredient in recipe:
            inv_item = inventory_repo.get_by_id(ingredient["inventory_item_id"])
            if not inv_item:
                continue
            
            required = ingredient["quantity_required"] * quantity
            if inv_item["current_stock"] < required:
                # We could still allow it but mark as "negative stock" or block it
                # For this demo, let's allow it to show the "Critical" state triggering
                pass

        # 3. Deduct stock from inventory
        deductions = []
        for ingredient in recipe:
            inv_item = inventory_repo.get_by_id(ingredient["inventory_item_id"])
            if not inv_item:
                continue
            
            required = ingredient["quantity_required"] * quantity
            new_stock = inv_item["current_stock"] - required
            
            inventory_repo.update_item(inv_item["id"], {"current_stock": new_stock})
            deductions.append({
                "item": inv_item["name"],
                "deducted": required,
                "remaining": new_stock
            })

        # 4. Log the sale
        pos_repo.log_sale(organization_id, menu_item_id, quantity)

        return {
            "status": "success",
            "deductions": deductions
        }

pos_service = POSService()
