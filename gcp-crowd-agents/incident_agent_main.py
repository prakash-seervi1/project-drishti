from agents.incident_agent import IncidentAgent

if __name__ == "__main__":
    print("[IncidentAgent] Standalone agent process starting...")
    agent = IncidentAgent()
    agent.start()
    # Keep the process alive
    import time
    while True:
        time.sleep(60) 