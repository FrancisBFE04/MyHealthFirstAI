"""Test Clarifai API"""
import httpx
import asyncio
import base64

async def test_clarifai():
    api_key = "625eb93b63b04dfda21c2caa177df589"
    
    # Clarifai Food Model - correct full URL
    url = "https://api.clarifai.com/v2/users/clarifai/apps/main/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs"
    
    headers = {
        "Authorization": f"Key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Minimal test image
    test_image = bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x01, 0x00, 0x05, 0x18, 0xD8, 0x4D, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
    ])
    
    b64_image = base64.b64encode(test_image).decode()
    
    payload = {
        "inputs": [
            {
                "data": {
                    "image": {
                        "base64": b64_image
                    }
                }
            }
        ]
    }
    
    print("Testing Clarifai Food Recognition...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text[:800]}")

asyncio.run(test_clarifai())
