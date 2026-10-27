import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables securely from .env
load_dotenv(override=True)

# Single location for model configuration
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-flash-latest"]

SYSTEM_INSTRUCTION = (
    "You are FinPilot AI, a financial research and education assistant. "
    "Explain financial concepts clearly, use structured answers when helpful, "
    "and distinguish facts from assumptions. Never guarantee investment returns. "
    "Do not claim to be a SEBI-registered investment adviser. Explain risks and "
    "limitations, and do not invent live market data. For current prices or financial "
    "figures, state when verification is needed."
)

class GeminiService:
    def __init__(self):
        self.default_model: str = DEFAULT_MODEL
        self._client = None

    def _get_client(self):
        # Re-check environment in case .env was refreshed
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file."
            )
        
        try:
            from google import genai
            return genai.Client(api_key=api_key)
        except ImportError:
            raise RuntimeError("The google-genai package is not installed.")

    def check_status(self) -> Dict[str, Any]:
        """Check if Gemini service is configured without revealing the API key."""
        api_key = os.getenv("GEMINI_API_KEY")
        return {
            "configured": bool(api_key),
            "model": self.default_model
        }

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        custom_system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a chat response using google-genai SDK.
        
        Takes messages list with format: [{'role': 'user'|'assistant', 'content': '...'}]
        Never returns or logs API key.
        """
        client = self._get_client()

        # Format conversation history
        conversation_lines = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "").strip()
            if not content:
                continue
            if role == "user":
                conversation_lines.append(f"User: {content}")
            else:
                conversation_lines.append(f"Assistant: {content}")

        if not conversation_lines:
            raise ValueError("No message content provided for the conversation.")

        prompt = "\n\n".join(conversation_lines)
        system_inst = custom_system_instruction or SYSTEM_INSTRUCTION

        # Candidate models to try: user configured model first, then fallbacks
        candidate_models = [self.default_model] + [m for m in FALLBACK_MODELS if m != self.default_model]
        last_error = None

        for model_name in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "system_instruction": system_inst,
                        "max_output_tokens": 1000,
                    }
                )

                answer = response.text
                if not answer:
                    answer = "I couldn't generate a response. Please try asking your question differently."

                return {
                    "role": "assistant",
                    "content": answer,
                    "model": model_name
                }

            except Exception as error:
                last_error = error
                error_str = str(error)

                # If it's a 503 spike or 404 on current model, try the next fallback model
                if "503" in error_str or "UNAVAILABLE" in error_str or "404" in error_str or "NOT_FOUND" in error_str:
                    continue
                else:
                    # Break immediately for auth or client input errors
                    break

        # If all candidates failed or non-retriable error
        error_str = str(last_error) if last_error else "Unknown error"
        if "API_KEY_INVALID" in error_str or "401" in error_str or "unregistered" in error_str.lower():
            raise ValueError("Invalid Gemini API key. Please check your credentials in the server .env.")
        elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            raise ValueError("Gemini API rate limit or quota exceeded. Please wait a moment and try again.")
        elif "ConnectError" in error_str or "getaddrinfo" in error_str or "timeout" in error_str.lower():
            raise ConnectionError("Network connection error reaching Google Gemini API. Please check your internet connection.")
        elif "503" in error_str or "UNAVAILABLE" in error_str:
            raise ValueError("Google Gemini models are temporarily experiencing high demand. Please try again shortly.")
        else:
            raise RuntimeError(f"Gemini API request failed: {error_str}")


gemini_service = GeminiService()
