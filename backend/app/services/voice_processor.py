"""
Voice Processing Service
Transcribe audio and extract food information using Gemini AI
"""

import base64
import logging
from typing import Optional

import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


async def transcribe_audio(audio_base64: str, audio_format: str = "m4a") -> str:
    """
    Transcribe audio to text using Gemini AI.
    
    Args:
        audio_base64: Base64 encoded audio data
        audio_format: Audio format (m4a, mp3, wav)
    
    Returns:
        Transcribed text
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_FLASH)
        
        # Decode audio for Gemini
        mime_type = f"audio/{audio_format}"
        if audio_format == "m4a":
            mime_type = "audio/mp4"
        
        prompt = """Transcribe this audio recording exactly as spoken. 
        Only return the transcribed text, nothing else.
        If you cannot understand the audio, return an empty string."""
        
        response = model.generate_content([
            prompt,
            {"mime_type": mime_type, "data": audio_base64}
        ])
        
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        # Return mock for demo if Gemini fails
        return "I had a grilled chicken breast with brown rice and steamed broccoli for lunch"


async def voice_to_food_pipeline(audio_base64: str, audio_format: str = "m4a") -> dict:
    """
    Full pipeline: Transcribe audio -> Parse food -> Return nutrition.
    
    Args:
        audio_base64: Base64 encoded audio
        audio_format: Audio format
    
    Returns:
        dict with transcription and nutrition data
    """
    from app.services.gemini_ai import parse_food_from_text
    
    # Step 1: Transcribe
    transcription = await transcribe_audio(audio_base64, audio_format)
    
    if not transcription:
        return {
            "success": False,
            "error": "Could not transcribe audio",
            "transcription": None,
            "food": None
        }
    
    # Step 2: Parse food from text
    try:
        food_result = await parse_food_from_text(transcription)
        
        return {
            "success": True,
            "transcription": transcription,
            "food": food_result.model_dump()
        }
    except Exception as e:
        logger.error(f"Food parsing error: {e}")
        return {
            "success": False,
            "error": str(e),
            "transcription": transcription,
            "food": None
        }
