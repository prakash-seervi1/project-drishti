# MCP Toolbox Demo

This folder demonstrates how to use the Google GenAI Toolbox (MCP Toolkit) with a YAML configuration, the toolbox server, and Node.js integration for agentic LLM workflows.

## Structure
- `my-tools.yaml`: Example YAML config defining sources and tools.
- `call-toolbox.js`: Node.js example for calling the toolbox server from code.

## How to Use
1. Download the toolbox binary from Google (see https://cloud.google.com/vertex-ai/docs/genai/toolbox/overview).
2. Edit `my-tools.yaml` to define your sources and tools.
3. Start the toolbox server:
   ```bash
   ./toolbox serve --config my-tools.yaml
   ```
4. Run the Node.js example to call a tool:
   ```bash
   node call-toolbox.js
   ```

## Notes
- This is a standalone demo and does not affect your main project code.
- You can extend the YAML and Node.js code to match your real use case (e.g., Firestore, REST APIs, etc.). 