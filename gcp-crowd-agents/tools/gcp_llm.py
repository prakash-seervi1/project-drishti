import os
from vertexai.preview.generative_models import GenerativeModel
from config import VERTEX_MODEL

def query_gemini(prompt: str) -> str:
    print(f"[LLM] Sending prompt to Gemini: {prompt[:500]}")  # Truncate for log readability
    try:
        model = GenerativeModel(VERTEX_MODEL)
        response = model.generate_content(prompt)
        print(f"[LLM] Gemini response: {response.text[:500]}")  # Truncate for log readability
        return response.text
    except Exception as e:
        print(f"[LLM] Gemini API error: {e}")
        return f"[Gemini API error: {e}]" 