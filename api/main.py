from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

app = FastAPI()

# Model Path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "saved_models", "1.keras")

# Load Model
MODEL = tf.keras.models.load_model(MODEL_PATH)

# Allowed Frontend Origins
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Class Names
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]


@app.get("/ping")
async def ping():
    return {"message": "Backend is running successfully"}


# Convert Uploaded File into Model Input
def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data))

    # Convert image to RGB
    image = image.convert("RGB")

    # Resize image according to model input shape
    image = image.resize((256, 256))

    # Convert to numpy array
    image = np.array(image)

    return image


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read uploaded image
    image = read_file_as_image(await file.read())

    # Add batch dimension
    img_batch = np.expand_dims(image, 0)

    # Prediction
    predictions = MODEL.predict(img_batch)

    # Get predicted class
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]

    # Get confidence score
    confidence = float(np.max(predictions[0]))

    return {
        "class": predicted_class,
        "confidence": confidence
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)