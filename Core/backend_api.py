from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Game import game_engine

app = FastAPI(title="AI NPC Demo API")

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


class ChatResponse(BaseModel):
    message: str
    actions: list
    inventory: list


@app.on_event("startup")
async def startup_event():
    """Initialize game engine on startup."""
    game_engine.initialize()


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Send a message to the NPC and get response + game actions.
    """
    # Get LLM response via game engine
    response_text = game_engine.process_turn(request.message, request.thread_id)
    
    # Get any pending game actions for frontend
    actions = game_engine.get_pending_actions()
    
    return ChatResponse(
        message=response_text,
        actions=actions,
        inventory=game_engine.get_inventory()
    )


@app.get("/state")
def get_state():
    """Get current game state for frontend sync."""
    return game_engine.get_state()


@app.post("/reset")
def reset_game():
    """Reset the game state."""
    game_engine.inventory.clear()
    game_engine.pending_actions.clear()
    # Re-initialize agent to reset memory if needed, though MemorySaver is separate
    # For now just clearing inventory is enough for a simple reset
    return {"status": "reset"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
