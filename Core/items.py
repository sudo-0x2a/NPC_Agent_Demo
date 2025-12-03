import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
items_config_dir = os.path.join(script_dir, "config/items")

# A simple item class
class Item:
    """Represents an in-game item."""
    
    def __init__(self, item_id: int, name: str, description: str = "", icon: str = None):
        self.id = item_id
        self.name = name
        self.description = description
        self.icon = icon

    @classmethod
    def from_config(cls, config_path: str) -> "Item":
        """Load an item from a JSON config file."""
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        return cls(
            item_id=config["id"],
            name=config["name"],
            description=config.get("description", ""),
            icon=config.get("icon")
        )

    def to_dict(self) -> dict:
        """Convert item to dictionary for frontend transmission."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon
        }

    def __repr__(self):
        return f"Item({self.id}, '{self.name}')"


def get_item(item_id: int) -> Item:
    """Get an item by loading its config file."""
    config_path = os.path.join(items_config_dir, f"item_{item_id}.json")
    if os.path.exists(config_path):
        return Item.from_config(config_path)
    return None
