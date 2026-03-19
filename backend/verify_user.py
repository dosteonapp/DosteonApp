import asyncio
from app.db.prisma import connect_db, disconnect_db, db

async def verify_user():
    await connect_db()
    email = "gatetejules1@gmail.com"
    p = await db.profile.find_first(where={"email": email})
    if p:
        print(f"FOUND: {p.id} - {p.email} - role: {p.role}")
    else:
        print(f"NOT FOUND: {email}")
    await disconnect_db()

if __name__ == "__main__":
    asyncio.run(verify_user())
