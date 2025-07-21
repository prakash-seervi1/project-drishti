class BaseAgent:
    def __init__(self, name, memory, tools, comms, short_term=None):
        self.name = name
        self.memory = memory  # e.g., FirestoreMemory(self.name)
        self.tools = tools    # e.g., {"llm": query_gemini, ...}
        self.comms = comms    # e.g., PubSubComms(self.name)
        self.short_term = short_term or []  # In-memory context window or Redis-based

    def append_short_term(self, session_id, entry):
        if hasattr(self.short_term, "append_context"):
            self.short_term.append_context(session_id, entry)
        elif isinstance(self.short_term, list):
            self.short_term.append(entry)
            if len(self.short_term) > 10:
                self.short_term.pop(0)

    def get_short_term(self, session_id):
        if hasattr(self.short_term, "get_context"):
            return self.short_term.get_context(session_id)
        elif isinstance(self.short_term, list):
            return "\n".join(self.short_term)
        return ""

    def handle_event(self, event):
        self.memory.save_event(event)
        if isinstance(self.short_term, list):
            self.short_term.append(event)
        # Custom event logic in subclasses
        pass

    def handle_query(self, user_query):
        # Custom query logic in subclasses
        pass 