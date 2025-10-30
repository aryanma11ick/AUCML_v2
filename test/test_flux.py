from dotenv import load_dotenv
import os
from huggingface_hub import InferenceClient

load_dotenv()

client = InferenceClient(
    provider="nebius",
    api_key=os.environ["HF_TOKEN"],
)

# output is a PIL.Image object
image = client.text_to_image(
    "iphone 20 pro max",
    model="black-forest-labs/FLUX.1-dev",
)

image.save("output.png")
print("Image saved as output.png")