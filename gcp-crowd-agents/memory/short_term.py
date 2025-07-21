import redis
import os
import json

class ShortTermMemory:
    def __init__(self, prefix="agent", host=None, port=None, password=None, db=0, ttl=600, max_turns=10):
        redis_conn_json = os.getenv("REDIS_CONN")
        if redis_conn_json:
            try:
                redis_info = json.loads(redis_conn_json)
                host = redis_info.get("host", host)
                port = int(redis_info.get("port", port or 6379))
                print(f"[ShortTermMemory] Using Redis from REDIS_CONN: host={host}, port={port}")
            except Exception as e:
                print(f"[ShortTermMemory] Failed to parse REDIS_CONN: {e}")
        else:
            print(f"[ShortTermMemory] Using Redis from args/env: host={host}, port={port}")
        self.host = host or os.getenv("REDIS_HOST", "localhost")
        self.port = port or int(os.getenv("REDIS_PORT", 6379))
        self.password = password or os.getenv("REDIS_PASSWORD", None)
        self.db = db
        self.ttl = ttl
        self.prefix = prefix
        self.max_turns = max_turns
        self.r = None  # Lazy connection

    def _get_redis(self):
        if self.r is None:
            try:
                self.r = redis.Redis(host=self.host, port=self.port, password=self.password, db=self.db, decode_responses=True)
                self.r.ping()
                print(f"[ShortTermMemory] Successfully connected to Redis at {self.host}:{self.port}")
            except Exception as e:
                print(f"[ShortTermMemory] Redis connection error: {e}")
                self.r = None
        return self.r

    def _key(self, session_id):
        return f"{self.prefix}:context:{session_id}"

    def set_context(self, session_id, context_list):
        r = self._get_redis()
        if not r:
            print("[ShortTermMemory] Redis not connected. set_context skipped.")
            return
        r.set(self._key(session_id), json.dumps(context_list), ex=self.ttl)

    def get_context(self, session_id):
        r = self._get_redis()
        if not r:
            print("[ShortTermMemory] Redis not connected. get_context returns empty.")
            return ""
        key = self._key(session_id)
        current = r.get(key)
        if current:
            try:
                context_list = json.loads(current)
                return "\n".join(context_list)
            except Exception:
                return current
        return ""

    def append_context(self, session_id, new_entry):
        r = self._get_redis()
        if not r:
            print("[ShortTermMemory] Redis not connected. append_context skipped.")
            return
        key = self._key(session_id)
        current = r.get(key)
        if current:
            try:
                context_list = json.loads(current)
            except Exception:
                context_list = [current]
        else:
            context_list = []
        context_list.append(new_entry)
        if len(context_list) > self.max_turns:
            context_list = context_list[-self.max_turns:]
        r.set(key, json.dumps(context_list), ex=self.ttl)

# Usage:
# memory = ShortTermMemory(host='your-redis-host', port=6379, password='your-password', max_turns=10)
# memory.append_context('session123', 'User: What is the event summary?')
# context = memory.get_context('session123') 