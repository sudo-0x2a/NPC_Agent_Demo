from langgraph.prebuilt import create_react_agent
from langchain_deepseek import ChatDeepSeek
from langchain_core.messages import HumanMessage, RemoveMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import REMOVE_ALL_MESSAGES
import os

# Global agent instance
agent = None
_game_engine = None

def initialize_agent(game_engine_instance):
    """
    Initialize the global agent with the provided game engine.
    """
    global agent, _game_engine
    _game_engine = game_engine_instance
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, "config/NPCs/system_prompt_1001.txt")
    
    model = ChatDeepSeek(model="deepseek-chat", temperature=1.0)
    system_prompt = open(config_path, "r").read()
    
    # Create the agent with the configured tools
    agent = create_react_agent(
        model,
        tools=[send_card],
        checkpointer=MemorySaver(),
        prompt=system_prompt
    )
    print("NPC Agent initialized.")

@tool
def send_card(confirmation: bool) -> str:
    """
    Send a friendship card to the player.
    Args:
        confirmation: Whether to confirm sending the card.
    Returns:
        Result message.
    """
    if not _game_engine:
        return "系统错误：游戏引擎未连接。"
        
    if not confirmation:
        return "取消发送卡片。"
    
    # Item ID for the friendship card
    FRIENDSHIP_CARD_ID = 1001
    
    success = _game_engine.transfer_item_to_player(FRIENDSHIP_CARD_ID)
    if success:
        return "闪亮的卡牌已成功送出！"
    else:
        return "发送失败，玩家背包已满。"

def chat(message: str, thread_id: str) -> str:
    """
    Chat with the NPC agent.
    Returns the agent's response text.
    """
    if not agent:
        return "Agent not initialized."
        
    response = agent.invoke(
        {"messages": [HumanMessage(content=message)]},
        {"configurable": {"thread_id": thread_id}}
    )
    return response["messages"][-1].content


def reset_agent(thread_id: str) -> bool:
    """
    Reset the agent's message history for a given thread.
    Returns True if successful.
    """
    if not agent:
        return False
    
    # Remove all messages from the thread
    agent.invoke(
        {"messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES)]},
        {"configurable": {"thread_id": thread_id}}
    )
    return True
