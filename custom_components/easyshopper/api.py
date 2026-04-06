import aiohttp
import asyncio
import json
import uuid
import base64
import logging
from datetime import datetime
from .const import BASE_URL, API_PATH, SUB_KEY, USER_AGENT

_LOGGER = logging.getLogger(__name__)

class EasyShopperAPI:
    """Async wrapper for the EASY Shopper API."""

    def __init__(self, session: aiohttp.ClientSession, device_id: str = None, secret: str = None):
        self.session = session
        self.device_id = device_id
        self.secret = secret
        self.token = None
        self.user_guid = None
        self.store_guid = None

    def get_headers(self, auth=None):
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "x-subscription-key": SUB_KEY,
            "User-Agent": USER_AGENT,
            "Accept-Language": "de-DE,de;q=0.9"
        }
        if auth:
            headers["Authorization"] = auth
        elif self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def signup(self) -> str:
        """Register a new virtual device and get a secret."""
        if not self.device_id:
            self.device_id = str(uuid.uuid4()).upper()
        
        url = f"{BASE_URL}{API_PATH}/v4/signup"
        payload = {"uniqueDeviceId": f"UUID-{self.device_id[:8]}"}
        
        async with self.session.post(url, json=payload, headers=self.get_headers()) as r:
            if r.status == 200:
                data = await r.json()
                self.secret = data.get("secret")
                return self.secret
            else:
                _LOGGER.error("Signup failed: %s", await r.text())
                return None

    async def login(self) -> bool:
        """Login to get a fresh Bearer token."""
        if not self.device_id or not self.secret:
            return False

        auth_str = f"{self.secret}:{self.device_id}"
        auth_b64 = base64.b64encode(auth_str.encode()).decode()
        
        url = f"{BASE_URL}{API_PATH}/v4/login"
        payload = {"uniqueDeviceId": f"UUID-{self.device_id[:8]}"}
        
        async with self.session.post(url, json=payload, headers=self.get_headers(f"Basic {auth_b64}")) as r:
            if r.status == 200:
                data = await r.json()
                self.token = data.get("authenticationToken")
                self.user_guid = data.get("userGuid")
                self.store_guid = data.get("storeGuid")
                return True
            return False

    async def accept_legal(self):
        """Accept T&C and Privacy policy."""
        if not self.token: return False
        
        headers = self.get_headers()
        
        # Terms
        async with self.session.get(f"{BASE_URL}{API_PATH}/v4/termsAndConditions", headers=headers) as r:
            if r.status == 200:
                legal_guid = (await r.json()).get("legalGuid")
                if legal_guid:
                    await self.session.put(f"{BASE_URL}{API_PATH}/v4/acceptTermsAndConditions", 
                                          json={"legalGuid": legal_guid}, headers=headers)

        # Privacy
        async with self.session.get(f"{BASE_URL}{API_PATH}/v4/dataPrivacy", headers=headers) as r:
            if r.status == 200:
                legal_guid = (await r.json()).get("legalGuid")
                if legal_guid:
                    await self.session.put(f"{BASE_URL}{API_PATH}/v4/acceptDataPrivacy", 
                                          json={"legalGuid": legal_guid}, headers=headers)
        return True

    async def get_nearest_stores(self, lat: float, lon: float, limit: int = 10):
        """Find nearby stores based on coordinates."""
        url = f"{BASE_URL}{API_PATH}/v4/store/nearest-neighbor"
        params = {"latitude": lat, "longitude": lon, "limit": limit}
        
        async with self.session.get(url, params=params, headers=self.get_headers()) as r:
            if r.status == 200:
                return await r.json()
            return []

    async def get_shopping_list(self):
        """Fetch all items from the shopping list."""
        if not self.token: await self.login()
        
        url = f"{BASE_URL}{API_PATH}/v5/shoppingList/get/"
        async with self.session.get(url, headers=self.get_headers()) as r:
            if r.status == 401: # Token expired
                await self.login()
                async with self.session.get(url, headers=self.get_headers()) as r2:
                    return await r2.json() if r2.status == 200 else []
            return await r.json() if r.status == 200 else []

    async def add_item(self, product_name: str, amount: int = 1, store_guid: str = None):
        """Add or update an item on the shopping list."""
        if not self.token: await self.login()
        target_store = store_guid or self.store_guid
        
        url = f"{BASE_URL}{API_PATH}/v5/shoppingList/addOrUpdate/{target_store}"
        
        # Simple category logic (can be expanded later)
        payload = {
            "amount": amount,
            "cgIcon": "diverse_nonfood",
            "cgLocalKey": "diverse_nonfood",
            "product": {
                "name": product_name,
                "cgIcon": "diverse_nonfood",
                "cgLocalKey": "diverse_nonfood"
            },
            "tag": product_name,
            "groupName": "diverse_nonfood"
        }

        async with self.session.post(url, json=payload, headers=self.get_headers()) as r:
            return r.status == 200

    async def delete_item(self, item_guid: str):
        """Remove an item from the shopping list."""
        if not self.token: await self.login()
        
        # The API usually uses DELETE or a specific endoint for removal.
        # Based on research, it might be /v4/shoppingList/delete or similar.
        # If unknown, we can try to 'update' with amount 0 if supported.
        # But let's check strings for 'delete' in shoppingList context.
        url = f"{BASE_URL}{API_PATH}/v4/shoppingList/delete"
        payload = {"shoppingListItemGuids": [item_guid]}
        
        async with self.session.post(url, json=payload, headers=self.get_headers()) as r:
            return r.status == 200
