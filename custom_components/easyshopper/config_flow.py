import voluptuous as vol
import aiohttp
import logging
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN, CONF_DEVICE_ID, CONF_SECRET, CONF_USER_GUID, CONF_STORE_GUID,
    CONF_PLZ, CONF_ADD_ITEM_TO_SHOPPING_LIST_ACCEPTED, URL_AGB, URL_PRIVACY
)
from .api import EasyShopperAPI

_LOGGER = logging.getLogger(__name__)

class EasyShopperConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for EASY Shopper."""

    VERSION = 1

    def __init__(self):
        self._api = None
        self._plz = None
        self._stores = []
        self._selected_store_guid = None
        self._tos_accepted = False

    async def async_step_user(self, user_input=None):
        """Handle the initial step: TOS and PLZ."""
        errors = {}
        if user_input is not None:
            self._plz = user_input[CONF_PLZ]
            self._tos_accepted = user_input[CONF_ADD_ITEM_TO_SHOPPING_LIST_ACCEPTED]
            
            if not self._tos_accepted:
                errors["base"] = "tos_not_accepted"
            else:
                return await self.async_step_select_store()

        data_schema = vol.Schema({
            vol.Required(CONF_PLZ): str,
            vol.Required(CONF_ADD_ITEM_TO_SHOPPING_LIST_ACCEPTED, default=False): bool,
        })

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "url_agb": URL_AGB,
                "url_privacy": URL_PRIVACY
            }
        )

    async def async_step_select_store(self, user_input=None):
        """Search stores by PLZ and let user select one."""
        errors = {}
        
        if self._api is None:
            self._api = EasyShopperAPI(async_get_clientsession(self.hass))

        if not self._stores:
            # 1. Geocode PLZ to Lat/Lon via Nominatim
            # Note: In a real integration, we might want a more robust way
            geo_url = f"https://nominatim.openstreetmap.org/search?postalcode={self._plz}&country=germany&format=json"
            headers = {"User-Agent": "HomeAssistant-EasyShopper-Integration"}
            
            try:
                async with self._api.session.get(geo_url, headers=headers) as r:
                    geo_data = await r.json()
                    if geo_data:
                        lat = float(geo_data[0]["lat"])
                        lon = float(geo_data[0]["lon"])
                        
                        # 2. Get nearest stores from EasyShopper API
                        self._stores = await self._api.get_nearest_stores(lat, lon)
                    else:
                        errors["base"] = "plz_not_found"
            except Exception as e:
                _LOGGER.error("Error geocoding PLZ: %s", e)
                errors["base"] = "geocoding_error"

        if user_input is not None:
            # User selected a store
            self._selected_store_guid = user_input[CONF_STORE_GUID]
            return await self.async_step_finish()

        if not self._stores and not errors:
            errors["base"] = "no_stores_found"

        if errors:
            # Back to step 1 if error
            return await self.async_step_user()

        # Create selection list
        store_options = {
            store["storeGuid"]: f"{store['name']} ({store.get('city', '')})"
            for store in self._stores
        }

        return self.async_show_form(
            step_id="select_store",
            data_schema=vol.Schema({
                vol.Required(CONF_STORE_GUID): vol.In(store_options)
            })
        )

    async def async_step_finish(self, user_input=None):
        """Create the bot account and save."""
        # 1. Signup
        secret = await self._api.signup()
        if not secret:
            return self.async_abort(reason="signup_failed")

        # 2. Login
        if not await self._api.login():
            return self.async_abort(reason="login_failed")

        # 3. Accept Legal
        await self._api.accept_legal()

        return self.async_create_entry(
            title=f"EASY Shopper ({self._plz})",
            data={
                CONF_DEVICE_ID: self._api.device_id,
                CONF_SECRET: self._api.secret,
                CONF_USER_GUID: self._api.user_guid,
                CONF_STORE_GUID: self._selected_store_guid,
                CONF_PLZ: self._plz
            }
        )
