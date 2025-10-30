import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "mistral"

def chat_with_mistral():
    messages = [
        {"role": "system", "content": "You are a helpful and creative AI assistant."}
    ]
    
    print("🤖 Mistral Chatbot — type 'exit' to quit\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Goodbye!")
            break

        messages.append({"role": "user", "content": user_input})

        payload = {
            "model": MODEL_NAME,
            "messages": messages,
            "stream": False  # set True if you want to stream
        }

        response = requests.post(OLLAMA_URL, json=payload)
        data = response.json()

        reply = data["message"]["content"]
        print(f"Mistral: {reply}\n")

        messages.append({"role": "assistant", "content": reply})


if __name__ == "__main__":
    chat_with_mistral()
