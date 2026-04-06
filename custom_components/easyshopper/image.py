"""Image platform for EASY Shopper (QR Code)."""
from __future__ import annotations

import io
import qrcode
from homeassistant.components.image import ImageEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN, CONF_USER_GUID

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the EASY Shopper image platform."""
    user_guid = entry.data[CONF_USER_GUID]
    async_add_entities([EasyShopperQRCodeImage(hass, entry, user_guid)])

class EasyShopperQRCodeImage(ImageEntity):
    """An image entity that displays the EasyShopper pairing QR code."""

    _attr_has_entity_name = True
    _attr_name = "Pairing QR Code"

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, user_guid: str) -> None:
        """Initialize the QR code image."""
        super().__init__(hass)
        self._attr_unique_id = f"{entry.entry_id}_qr_code"
        self._user_guid = user_guid
        self._image_bytes = None
        self._generate_qr()

    def _generate_qr(self):
        """Generate QR code bytes."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(self._user_guid)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        self._image_bytes = img_byte_arr.getvalue()
        self._attr_image_last_updated = dt_util.utcnow()

    async def async_image(self) -> bytes | None:
        """Return bytes of the image."""
        return self._image_bytes
