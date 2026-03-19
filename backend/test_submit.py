import asyncio
import httpx
import uuid

async def test_submit():
    url = "http://localhost:8000/api/v1/restaurant/opening-checklist/submit"
    # Note: This will fail authentication unless we provide a token.
    # But we can try to see if it even reaches the logic or if it fails with 401 first.
    payload = {
        "counts": {
            str(uuid.uuid4()): 10.0
        }
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_submit())
