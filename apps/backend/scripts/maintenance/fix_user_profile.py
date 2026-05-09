import asyncio
import uuid
from app.db.prisma import connect_db, disconnect_db, db

async def restore_profile():
    await connect_db()
    email = "gatetejules1@gmail.com"
    
    # 1. Ensure the organization exists
    org_name = "Dosteon Test Restaurant"
    org = await db.organization.find_first(where={"name": org_name})
    if not org:
        print(f"Creating organization: {org_name}")
        org = await db.organization.create(data={"name": org_name, "type": "restaurant"})
    
    org_id = org.id
    
    # 2. Check if user exists
    print(f"Checking profile for: {email}")
    existing = await db.profile.find_first(where={"email": email})
    
    if existing:
        print(f"Updating existing profile: {existing.id}")
        await db.profile.update(
            where={"id": existing.id},
            data={
                "role": "OWNER",
                "organization_id": org_id,
                "first_name": "Jules",
                "last_name": "Gatete"
            }
        )
    else:
        print(f"Creating new profile for: {email}")
        user_id = str(uuid.uuid4())
        await db.profile.create(
            data={
                "id": user_id,
                "email": email,
                "role": "OWNER",
                "first_name": "Jules",
                "last_name": "Gatete",
                "organization_id": org_id
            }
        )
    
    print(f"✅ SUCCESS: Profile restored for {email}")
    await disconnect_db()

if __name__ == "__main__":
    asyncio.run(restore_profile())
