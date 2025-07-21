import json
import logging

def extract_json_from_markdown(text):
    """
    Extract JSON from a markdown code block or plain text.
    """
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]
    if text.startswith('```'):
        text = text[3:]
    if text.endswith('```'):
        text = text[:-3]
    return text


def call_gemini(model, prompt, *parts):
    """
    Standard Gemini invocation with error handling and JSON extraction.
    Returns (parsed_json, raw_response_text)
    """
    try:
        response = model.generate_content([prompt, *parts])
        text = extract_json_from_markdown(response.text)
        result = json.loads(text)
        return result, response.text
    except Exception as e:
        logging.error(f"[GeminiUtils] Failed to parse Gemini response: {e}, raw: {getattr(response, 'text', None)}")
        return None, getattr(response, 'text', None) 