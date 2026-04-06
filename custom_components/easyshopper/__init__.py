"""The EASY Shopper integration."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import EasyShopperAPI
from .const import (
    DOMAIN, CONF_DEVICE_ID, CONF_SECRET, CONF_STORE_GUID, CONF_USER_GUID
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.TODO, Platform.IMAGE]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up EASY Shopper from a config entry."""
    session = async_get_clientsession(hass)
    api = EasyShopperAPI(
        session,
        device_id=entry.data[CONF_DEVICE_ID],
        secret=entry.data[CONF_SECRET]
    )

    # Validate login and get initial tokens
    if not await api.login():
        _LOGGER.error("Failed to login to EASY Shopper")
        return False

    async def async_update_data():
        """Fetch data from API."""
        try:
            return await api.get_shopping_list()
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}")

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name="easyshopper_list",
        update_method=async_update_data,
        update_interval=timedelta(minutes=5),
    )

    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "api": api,
        "coordinator": coordinator,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
