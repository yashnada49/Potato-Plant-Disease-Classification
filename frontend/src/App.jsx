import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      alert("Please upload an image first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);

      setPrediction(response.data);

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.detail || "Prediction failed");
      } else {
        alert("Server connection failed");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="main-card">

        <div className="left-section">
          <h1>AI Potato Disease Detection</h1>

          <p>
            Upload potato leaf images and detect diseases instantly
            using Deep Learning and Computer Vision.
          </p>

          <div className="feature-box">
            <h3>Deep Learning Model</h3>
            <p>
              CNN model trained using TensorFlow and Keras.
            </p>
          </div>

          <div className="feature-box">
            <h3>FastAPI Backend</h3>
            <p>
              Real-time image prediction with REST API integration.
            </p>
          </div>

          <div className="feature-box">
            <h3>Modern Frontend</h3>
            <p>
              Built using React, Vite, Axios, and Modern CSS.
            </p>
          </div>
        </div>

        <div className="right-section">

          <h2>Upload Leaf Image</h2>

          <p className="subtext">
            Supported formats: JPG, PNG, JPEG
          </p>

          <label className="upload-box">

            <div className="upload-icon">🌿</div>

            <p>Click to Upload Image</p>

            <span>Drag & Drop Supported</span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="preview-image"
            />
          )}

          <button
            className="predict-btn"
            onClick={handlePredict}
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict Disease"}
          </button>

          {prediction && (
            <div className="result-box">

              <h3>Prediction Result</h3>

              <div className="result-row">
                <span>Disease:</span>
                <strong>{prediction.class}</strong>
              </div>

              <div className="result-row">
                <span>Confidence:</span>
                <strong>
                  {(prediction.confidence * 100).toFixed(2)}%
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${prediction.confidence * 100}%`,
                  }}
                ></div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;