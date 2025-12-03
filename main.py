"""
AI NPC Demo
Game Entry Point
"""
import os
import sys
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add Core to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Core'))

from Core.Game import game_engine

# Get paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GRAPHICS_DIR = os.path.join(BASE_DIR, "Graphics")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    game_engine.initialize()
    print("🎮 AI NPC Demo Server Started!")
    print("📍 Open http://localhost:8000 in your browser")
    yield
    # Shutdown (if needed)
    print("👋 Server shutting down...")


app = FastAPI(title="AI NPC Demo", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


class ChatResponse(BaseModel):
    message: str
    actions: list
    inventory: list


# API Endpoints
@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """Send a message to the NPC and get response + game actions."""
    response_text = game_engine.process_turn(request.message, request.thread_id)
    actions = game_engine.get_pending_actions()
    
    return ChatResponse(
        message=response_text,
        actions=actions,
        inventory=game_engine.get_inventory()
    )


@app.get("/api/state")
def get_state():
    """Get current game state for frontend sync."""
    return game_engine.get_state()


@app.post("/api/reset")
def reset_game(thread_id: str = "player1"):
    """Reset the game state and agent memory."""
    game_engine.reset(thread_id)
    return {"status": "reset"}


# Serve static files
app.mount("/assets", StaticFiles(directory=os.path.join(GRAPHICS_DIR, "assets")), name="assets")
app.mount("/interface", StaticFiles(directory=os.path.join(GRAPHICS_DIR, "interface")), name="interface")
app.mount("/node_modules", StaticFiles(directory=os.path.join(GRAPHICS_DIR, "node_modules")), name="node_modules")


# Serve index.html for root
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(GRAPHICS_DIR, "index.html"))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
