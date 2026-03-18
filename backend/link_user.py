import asyncio
from prisma import Prisma

async def link_user():
    db = Prisma()
    await db.connect()
    
    email = "gatetejules1@gmail.com"
    org_name = "Dosteon Demo Restaurant"
    
    org = await db.organization.find_first(where={"name": org_name})
    if not org:
        print("Org not found!")
        return
        
    profile = await db.profile.find_first(where={"email": email})
    if not profile:
        # Create profile if not exists
        # Note: id should be a Supabase Auth ID, but for testing we can use a dummy UUID
        print(f"Profile {email} not found, creating dummy...")
        import uuid
        profile = await db.profile.create(
            data={
                "id": str(uuid.uuid4()),
                "email": email,
                "first_name": "Jules",
                "last_name": "Gatete",
                "organization_id": org.id,
                "role": "MANAGER"
            }
        )
    else:
        await db.profile.update(
            where={"id": profile.id},
            data={
                "organization_id": org.id,
                "role": "MANAGER",
                "first_name": "Jules",
                "last_name": "Gatete"
            }
        )
    
    print(f"Successfully linked {email} (Jules G.) to {org_name}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(link_user())
