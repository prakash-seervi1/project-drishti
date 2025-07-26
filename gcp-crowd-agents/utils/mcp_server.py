import json
import logging
from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any
from tools import db_tools
import aiohttp
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

ALL_TOOLS = {
    "fetch_incidents": {"function": db_tools.fetch_incidents, "schema": {"description": "Fetch all incidents"}},
    "get_active_incidents": {"function": db_tools.get_active_incidents, "schema": {"description": "Fetch all non-closed incidents"}},
    "fetch_zones": {"function": db_tools.fetch_zones, "schema": {"description": "Fetch all zones"}},
    "fetch_responders": {"function": db_tools.fetch_responders, "schema": {"description": "Fetch all responders"}},
    "get_available_responders": {"function": db_tools.get_available_responders, "schema": {"description": "Fetch only available responders"}},
    "fetch_alerts": {"function": db_tools.fetch_alerts, "schema": {"description": "Fetch all alerts"}},
    "analyze_responder_assignments": {"function": db_tools.analyze_responder_assignments, "schema": {"description": "Analyze responder assignments"}},
    "assign_responder_to_incident": {"function": db_tools.assign_responder_to_incident, "schema": {"description": "Assign a responder to an incident"}},
    "assign_any_responder_to_incident": {"function": db_tools.assign_any_responder_to_incident, "schema": {"description": "Assign any available responder to an incident"}},
    "assign_responder_to_zone": {"function": db_tools.assign_responder_to_zone, "schema": {"description": "Assign a responder to a zone"}},
    "assign_any_responder_to_zone": {"function": db_tools.assign_any_responder_to_zone, "schema": {"description": "Assign any available responder to a zone"}},
    "notify_unavailable": {"function": db_tools.notify_unavailable, "schema": {"description": "Log an alert for unavailable responders"}},
    "suggest_zones_needing_responders": {"function": db_tools.suggest_zones_needing_responders, "schema": {"description": "Suggest zones needing responders"}},
}

class MCPServer:
    def __init__(self):
        self.tools = ALL_TOOLS

    def handle_request(self, request_data: Dict) -> Dict:
        """Handles JSON-RPC requests."""
        try:
            method = request_data.get("method")
            params = request_data.get("params", {})
            request_id = request_data.get("id")

            if method == "mcp.discover":
                response = {
                    "jsonrpc": "2.0",
                    "result": {
                        "tools": [tool["schema"] for tool in self.tools.values()]
                    },
                    "id": request_id
                }
                logger.info(f"[MCPServer] Discovered tools: {response['result']['tools']}")
                return response

            elif method in self.tools:
                result = self.tools[method]["function"](**params)
                response = {
                    "jsonrpc": "2.0",
                    "result": result,
                    "id": request_id
                }
                logger.info(f"[MCPServer] Executed {method} with params {params}: {result}")
                return response

            else:
                logger.error(f"[MCPServer] Method {method} not found")
                return {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32601,
                        "message": f"Method {method} not found"
                    },
                    "id": request_id
                }

        except Exception as e:
            logger.error(f"[MCPServer] Error handling request: {str(e)}")
            return {
                "jsonrpc": "2.0",
                "error": {
                    "code": -32600,
                    "message": str(e)
                },
                "id": request_id
            }

class MCPClient:
    def __init__(self, server_url: str = "http://localhost:8080/mcp/mcp_server"):
        self.server_url = server_url

    def discover_tools(self) -> Dict[str, Any]:
        """Discovers available tools from the MCP server."""
        try:
            response = requests.post(self.server_url, json={
                "jsonrpc": "2.0",
                "method": "mcp.discover",
                "id": 1
            })
            data = response.json()
            logger.info(f"[MCPClient] Discover response: {data}")
            return data
        except Exception as e:
            logger.error(f"[MCPClient] Discover error: {str(e)}")
            raise

    def call_tool(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calls a tool on the MCP server."""
        try:
            response = requests.post(self.server_url, json={
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 2
            })
            data = response.json()
            logger.info(f"[MCPClient] Tool call response for {method}: {data}")
            return data
        except Exception as e:
            logger.error(f"[MCPClient] Tool call error: {str(e)}")
            raise

    async def close(self):
        logger.info("[MCPClient] Closing...")
        await self.session.close()

# FastAPI endpoint for MCP server
mcp_server = MCPServer()

@router.post("/mcp_server")
async def mcp_endpoint(request: Request):
    try:
        request_data = await request.json()
        response = mcp_server.handle_request(request_data)
        return response
    except Exception as e:
        logger.error(f"[MCPServer] Endpoint error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))