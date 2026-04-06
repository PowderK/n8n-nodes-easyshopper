import voluptuous as vol
import aiohttp
import logging
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN, CONF_DEVICE_ID, CONF_SECRET, CONF_USER_GUID, CONF_STORE_GUID,
    DEFAULT_STORE_GUID
)
from .api import EasyShopperAPI

_LOGGER = logging.getLogger(__name__)

class EasyShopperConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for EASY Shopper."""

    VERSION = 1

    def __init__(self):
        self._api = None

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            return await self.async_step_finish()

        data_schema = vol.Schema({})

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors
        )

    async def async_step_finish(self, user_input=None):
        """Create the bot account and save."""
        if self._api is None:
            self._api = EasyShopperAPI(async_get_clientsession(self.hass))
        # 1. Signup
        secret = await self._api.signup()
        if not secret:
            return self.async_abort(reason="signup_failed")

        # 2. Login
        if not await self._api.login():
            return self.async_abort(reason="login_failed")

        return self.async_create_entry(
            title="EASY Shopper",
            data={
                CONF_DEVICE_ID: self._api.device_id,
                CONF_SECRET: self._api.secret,
                CONF_USER_GUID: self._api.user_guid,
                CONF_STORE_GUID: DEFAULT_STORE_GUID
            }
        )
