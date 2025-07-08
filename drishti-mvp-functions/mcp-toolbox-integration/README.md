# MCP Toolbox Integration (Production)

This folder contains a real, production-ready implementation of integrating the Google GenAI Toolbox (MCP Toolkit) with the Drishti chat agent.

- All data/tool access is routed through the toolbox server using a YAML config.
- The chat agent code here shows how to call the toolbox server for Firestore queries and more.
- This does NOT affect your main codebase.

## Files
- `drishti-tools.yaml`: Production YAML config for toolbox (Firestore sources, tools, toolsets).
- `chat-agent-mcp.js`: Chat agent code using the toolbox for all data access.

## Usage
1. Edit `drishti-tools.yaml` with your real GCP project ID and any extra tools you need.
2. Start the toolbox server:
   ```bash
   ./toolbox serve --config drishti-tools.yaml
   ```
3. Set the `TOOLBOX_URL` environment variable if the toolbox is not on localhost.
4. Use `chat-agent-mcp.js` as your agent backend (deploy as Firebase Function, Cloud Run, etc.).

## Note
- This is a standalone, production-ready integration. Your main code is untouched. 