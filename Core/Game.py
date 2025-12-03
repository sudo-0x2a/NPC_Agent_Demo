from items import Item, get_item
from npc_agent import initialize_agent, chat, reset_agent


class GameEngine:
    """Mini game engine that manages player inventory and game state changes."""
    
    def __init__(self):
        self.inventory = []
        self.max_slots = 8
        self.pending_actions = []  # Actions to send to frontend
    
    def initialize(self):
        """Initialize the game resources and agent."""
        # Initialize the external agent module with this engine instance
        initialize_agent(self)
        print("Game initialized.")

    def process_turn(self, message: str, thread_id: str) -> str:
        """
        Process a game turn: chat with agent and apply effects.
        Returns the agent's response text.
        """
        # Delegate the chat logic to the npc_agent module
        response_text = chat(message, thread_id)
        return response_text

    # Inventory Management
    def add_item_to_inventory(self, item: Item) -> bool:
        """Add an item to player's inventory. Returns True if successful."""
        if len(self.inventory) >= self.max_slots:
            return False
        self.inventory.append(item)
        # Queue action for frontend
        self.pending_actions.append({
            "type": "add_item",
            "item": item.to_dict(),
            "slot": len(self.inventory) - 1
        })
        return True
    
    def remove_item_from_inventory(self, item_id: int) -> bool:
        """Remove an item from inventory by ID. Returns True if successful."""
        for i, item in enumerate(self.inventory):
            if item.id == item_id:
                self.inventory.pop(i)
                self.pending_actions.append({
                    "type": "remove_item",
                    "item_id": item_id,
                    "slot": i
                })
                return True
        return False
    
    def get_inventory(self) -> list:
        """Get current inventory as list of dicts for frontend."""
        return [item.to_dict() for item in self.inventory]
    
    # Item Transfer (called by NPC tools)
    def transfer_item_to_player(self, item_id: int) -> bool:
        """Transfer an item from NPC to player's inventory."""
        item = get_item(item_id)
        if item is None:
            return False
        return self.add_item_to_inventory(item)
    
    # Frontend Sync
    def get_pending_actions(self) -> list:
        """Get and clear pending actions for frontend."""
        actions = self.pending_actions.copy()
        self.pending_actions.clear()
        return actions
    
    def get_state(self) -> dict:
        """Get full game state for frontend sync."""
        return {
            "inventory": self.get_inventory(),
            "max_slots": self.max_slots
        }

    def reset(self, thread_id: str = "player1") -> bool:
        """Reset all game state and agent memory."""
        # Clear inventory
        self.inventory.clear()
        self.pending_actions.clear()
        
        # Reset agent message history
        reset_agent(thread_id)
        
        print("Game state reset.")
        return True


# Global game engine instance
game_engine = GameEngine()
