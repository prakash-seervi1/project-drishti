from fastapi import APIRouter
from agents.command import CommandAgent

router = APIRouter()
command_agent = CommandAgent()

# @router.post("/ai_command_suggestions")
# def ai_command_suggestions():
#     result = command_agent.get_command_suggestions()
#     return result

@router.post("/ai_summary")
def ai_summary():
    return command_agent.get_summary()

@router.post("/ai_resource_recommendations")
def ai_resource_recommendations():
    return command_agent.get_resource_recommendations()

@router.post("/ai_command_actions")
def ai_command_actions():
    return command_agent.get_command_actions() 