"""Todo platform for EASY Shopper."""
from __future__ import annotations

from typing import Any
from homeassistant.components.todo import (
    TodoListEntity,
    TodoListEntityFeature,
    TodoItem,
    TodoItemStatus,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, CONF_STORE_GUID
from .api import EasyShopperAPI

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the EASY Shopper todo platform."""
    data = hass.data[DOMAIN][entry.entry_id]
    api: EasyShopperAPI = data["api"]
    coordinator = data["coordinator"]

    async_add_entities([EasyShopperTodoList(coordinator, api, entry)])

class EasyShopperTodoList(CoordinatorEntity, TodoListEntity):
    """A EASY Shopper todo list."""

    _attr_has_entity_name = True
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
    )

    def __init__(self, coordinator, api: EasyShopperAPI, entry: ConfigEntry) -> None:
        """Initialize the todo list."""
        super().__init__(coordinator)
        self._api = api
        self._entry = entry
        self._attr_name = "EASY Shopper"
        self._attr_unique_id = f"{entry.entry_id}_todo"

    @property
    def todo_items(self) -> list[TodoItem] | None:
        """Return the todo items."""
        if self.coordinator.data is None:
            return None

        items = []
        for item in self.coordinator.data:
            product = item.get("product") or {}
            brand = product.get("brand")
            p_name = product.get("name")
            tag = item.get("tag")
            amount = item.get("amount", 1)
            unit = item.get("unit") or ""

            display_name = tag or p_name or brand or "Unbekannter Artikel"
            if brand and p_name and brand not in display_name:
                display_name = f"[{brand}] {display_name}"
            
            if amount > 1 or unit:
                display_name = f"{amount}x {display_name} {unit}".strip()

            items.append(
                TodoItem(
                    summary=display_name,
                    uid=item["shoppingListItemGuid"],
                    status=TodoItemStatus.NEEDS_ACTION,
                )
            )
        return items

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Add an item to the list."""
        # Note: We use a default amount of 1 and generic category for now
        await self._api.add_item(
            product_name=item.summary,
            store_guid=self._entry.data.get(CONF_STORE_GUID)
        )
        await self.coordinator.async_refresh()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Update a todo item (Delete if completed)."""
        if item.status == TodoItemStatus.COMPLETED:
            # Delete from EasyShopper if marked as done in HA
            await self._api.delete_item(item.uid)
        
        await self.coordinator.async_refresh()

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Delete items from the list."""
        for uid in uids:
            await self._api.delete_item(uid)
        await self.coordinator.async_refresh()
