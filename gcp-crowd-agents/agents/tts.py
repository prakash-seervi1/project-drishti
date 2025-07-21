import base64
from google.cloud import texttospeech
# If Vertex AI Speech is available, import and use it here
# from vertexai.preview.generative_models import GenerativeModel

class TTSAgent:
    def __init__(self):
        # You can add Vertex AI Speech client init here if available
        self.tts_client = texttospeech.TextToSpeechClient()

    def synthesize_speech(self, text, language="en-US", voice_name=None):
        # Try Vertex AI Speech here if you want (not shown, as most regions use classic TTS)
        # Fallback to Google Cloud TTS
        input_text = texttospeech.SynthesisInput(text=text)
        voice_params = {
            "language_code": language,
            "ssml_gender": texttospeech.SsmlVoiceGender.NEUTRAL
        }
        if voice_name:
            voice_params["name"] = voice_name
        voice = texttospeech.VoiceSelectionParams(**voice_params)
        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        response = self.tts_client.synthesize_speech(input=input_text, voice=voice, audio_config=audio_config)
        audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")
        return {"success": True, "audio_base64": audio_base64} 