from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests, os, json, io, base64
from huggingface_hub import InferenceClient

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change this later in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Model setup ===
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "gemma3:4b"
client = InferenceClient(api_key=os.environ["HF_TOKEN"])
sessions = {}

# === Keyword triggers ===
IMAGE_TRIGGER_WORDS = ["generate", "visualize", "make image", "render"]

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "guest")
    user_message = data.get("message", "")

    # --- Basic system prompt ---
    system_prompt = """
    You are AURA — a friendly creative assistant that helps users design ad ideas.
    Be short, conversational, and guide them step by step.
    Ask one short follow-up question at a time.
    When they say words like 'generate', 'make image', or 'show ad',
    stop asking questions and let the backend create the image.
    """

    # --- Conversation memory ---
    if user_id not in sessions:
        sessions[user_id] = [{"role": "system", "content": system_prompt}]
    conversation = sessions[user_id]
    conversation.append({"role": "user", "content": user_message})

    # --- Normal chat flow ---
    payload = {"model": MODEL, "messages": conversation, "stream": False}
    response = requests.post(OLLAMA_URL, json=payload)

    try:
        data = response.json()
    except json.JSONDecodeError:
        cleaned = response.text.split("\n")[-1]
        data = json.loads(cleaned)

    reply = data["message"]["content"]
    conversation.append({"role": "assistant", "content": reply})

    # --- Check if message contains any trigger word ---
    triggered = any(word in user_message.lower() for word in IMAGE_TRIGGER_WORDS)

    if triggered:
        # Step 1: Ask Gemma to summarize conversation into an image prompt
        prompt_payload = {
            "model": MODEL,
            "messages": conversation + [
                {
                    "role": "user",
                    "content": (
                        "Summarize this conversation as a cinematic, vivid text-to-image prompt "
                        "for an ad generator. Focus on visuals, mood, lighting, and brand tone."
                    ),
                }
            ],
            "stream": False,
        }
        prompt_response = requests.post(OLLAMA_URL, json=prompt_payload)
        prompt_data = prompt_response.json()
        image_prompt = prompt_data["message"]["content"]

        # Step 2: Generate image using Flux
        image = client.text_to_image(image_prompt, model="black-forest-labs/FLUX.1-dev")

        # Step 3: Convert image to Base64 (no file saving)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return {
            "reply": "Here's your generated ad image! ✨",
            "triggered": True,
            "image_prompt": image_prompt,
            "image_base64": img_str
        }

    return {"reply": reply, "triggered": False}
