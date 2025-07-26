class BaseAgent:
    def __init__(self, name, memory, tools, comms):
        self.name = name
        self.memory = memory  # e.g., FirestoreMemory(self.name)
        self.tools = tools    # e.g., {"llm": query_gemini, ...}
        self.comms = comms    # e.g., PubSubComms(self.name)

    def handle_event(self, event):
        self.memory.save_event(event)
        # Custom event logic in subclasses
        pass

    def handle_query(self, user_query):
        # Custom query logic in subclasses
        pass 