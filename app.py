from flask import Flask, render_template, request, jsonify
import os
import json
from datetime import datetime, timezone
import base64
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
from PIL import Image as PilImage

from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)

# Load the trained model
model = load_model("model/dog_skin_disease_model.h5")

# Define upload folder
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Class labels
CLASS_LABELS = ["Dermatitis", "Fungal Infections", "Healthy", "Hypersensitivity", "Demodicosis", "Ringworm"]

HEALTHY_LABEL = "Healthy"
HEALTHY_INDEX = CLASS_LABELS.index(HEALTHY_LABEL)

DIGITAL_TWIN_PROFILES_PATH = os.path.join(os.path.dirname(__file__), "digital_twin_profiles.json")

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _load_profiles() -> dict:
    if not os.path.exists(DIGITAL_TWIN_PROFILES_PATH):
        return {}
    try:
        with open(DIGITAL_TWIN_PROFILES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception:
        # Corrupt/unreadable file should not break predictions.
        return {}

def _save_profiles(profiles: dict) -> None:
    tmp_path = DIGITAL_TWIN_PROFILES_PATH + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(profiles, f, indent=2)
    os.replace(tmp_path, DIGITAL_TWIN_PROFILES_PATH)

def _get_or_create_profile(dog_id: str) -> dict:
    profiles = _load_profiles()
    if dog_id in profiles:
        return profiles[dog_id]

    # Default baseline: assume "healthy" probability around 0.5.
    # Users can refine this by setting a baseline using normal images/videos.
    profile = {
        "dog_id": dog_id,
        "n_samples": 0,
        "healthy_prob_mean": 0.5,
        "healthy_prob_M2": 0.0,
        "healthy_threshold": 0.5,
        "probs_mean": [0.0 for _ in CLASS_LABELS],
        "updated_at": None,
    }
    profiles[dog_id] = profile
    _save_profiles(profiles)
    return profile

def _compute_threshold_from_state(n_samples: int, mean: float, M2: float) -> tuple[float, float]:
    if n_samples < 2:
        std = 0.0
        threshold = mean
    else:
        std = float(np.sqrt(M2 / (n_samples - 1)))
        threshold = float(max(0.0, mean - std))
    return threshold, std

def _persist_profile(profile: dict) -> None:
    profiles = _load_profiles()
    profiles[profile["dog_id"]] = profile
    _save_profiles(profiles)

def _update_profile_with_probs(profile: dict, probs: np.ndarray, persist: bool = True) -> dict:
    # Online update for healthy probability mean/std (Welford) + mean of full class probs.
    healthy_prob = float(probs[HEALTHY_INDEX])
    n_old = int(profile.get("n_samples", 0))
    n_new = n_old + 1

    mean_old = float(profile.get("healthy_prob_mean", 0.5))
    M2_old = float(profile.get("healthy_prob_M2", 0.0))

    delta = healthy_prob - mean_old
    mean_new = mean_old + (delta / n_new)
    delta2 = healthy_prob - mean_new
    M2_new = M2_old + (delta * delta2)

    probs_mean_old = profile.get("probs_mean", [0.0 for _ in CLASS_LABELS])
    probs_mean_new = []
    for j in range(len(CLASS_LABELS)):
        old = float(probs_mean_old[j]) if j < len(probs_mean_old) else 0.0
        x = float(probs[j])
        probs_mean_new.append(old + (x - old) / n_new)

    threshold, _std = _compute_threshold_from_state(n_new, mean_new, M2_new)

    updated = {
        **profile,
        "n_samples": n_new,
        "healthy_prob_mean": mean_new,
        "healthy_prob_M2": M2_new,
        "healthy_threshold": threshold,
        "probs_mean": probs_mean_new,
        "updated_at": _now_iso(),
    }

    # Persist update (optional for performance when called in loops).
    if persist:
        _persist_profile(updated)
    return updated

def health_status_from_healthy_prob(healthy_prob: float, profile: dict) -> str:
    threshold = float(profile.get("healthy_threshold", 0.5))
    return "Healthy" if healthy_prob >= threshold else "Unhealthy"

def health_status_from_label(label: str) -> str:
    """Health status should follow predicted label (Healthy => Healthy else Unhealthy)."""
    return "Healthy" if label == HEALTHY_LABEL else "Unhealthy"

def predict_image_from_pil(pil_img: PilImage.Image) -> tuple[str, np.ndarray]:
    """Run the existing image model on a PIL image."""
    # Keep the preprocessing identical to the existing /predict route.
    img_array = image.img_to_array(pil_img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    predictions = model.predict(img_array, verbose=0)
    probs = predictions[0]
    class_index = int(np.argmax(probs))
    return CLASS_LABELS[class_index], probs

def predict_image_from_path(filepath: str) -> tuple[str, np.ndarray]:
    """Load an image from disk and predict."""
    pil_img = image.load_img(filepath, target_size=(224, 224))
    return predict_image_from_pil(pil_img)

def predict_frame(frame_bgr: np.ndarray) -> tuple[str, np.ndarray]:
    """Predict from an OpenCV frame (BGR)."""
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    pil_img = PilImage.fromarray(frame_rgb).resize((224, 224))
    return predict_image_from_pil(pil_img)

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(file.filename))
    file.save(filepath)

    dog_id = request.form.get("dog_id", "default")
    profile = _get_or_create_profile(dog_id)

    label, probs = predict_image_from_path(filepath)
    healthy_prob = float(probs[HEALTHY_INDEX])
    health_status = health_status_from_label(label)

    return jsonify(
        {
            "prediction": label,
            "health_status": health_status,
            "healthy_probability": healthy_prob,
            "baseline_threshold": float(profile.get("healthy_threshold", 0.5)),
            "dog_id": dog_id,
        }
    )

@app.route("/predict_video", methods=["POST"])
def predict_video():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(file.filename))
    file.save(filepath)

    dog_id = request.form.get("dog_id", "default")
    profile = _get_or_create_profile(dog_id)

    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return jsonify({"error": "Could not open video"}), 400

    # Extract one frame every 1 second.
    interval_seconds = 1
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps <= 0:
        fps = 25.0  # fallback
    step_frames = max(1, int(round(fps * interval_seconds)))

    results = []
    unhealthy_thumbnails = []
    UNHEALTHY_THUMB_MAX = 8  # keep response size reasonable
    thumb_count = 0
    frame_index = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index % step_frames == 0:
            label, probs = predict_frame(frame)
            healthy_prob = float(probs[HEALTHY_INDEX])
            health_status = health_status_from_label(label)
            results.append(
                {
                    "frame_index": frame_index,
                    "time_seconds": round(frame_index / fps, 3),
                    "predicted_label": label,
                    "healthy_probability": healthy_prob,
                    "health_status": health_status,
                }
            )

            # For output/debug: include a small thumbnail only for Unhealthy frames.
            if health_status == "Unhealthy" and thumb_count < UNHEALTHY_THUMB_MAX:
                try:
                    # Resize to reduce payload size before JPEG encoding.
                    frame_small = cv2.resize(frame, (224, 224), interpolation=cv2.INTER_AREA)
                    ok, buf = cv2.imencode(".jpg", frame_small, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    if ok:
                        b64 = base64.b64encode(buf).decode("utf-8")
                        unhealthy_thumbnails.append(
                            {
                                "frame_index": frame_index,
                                "time_seconds": round(frame_index / fps, 3),
                                "predicted_label": label,
                                "healthy_probability": healthy_prob,
                                "image_base64": b64,
                            }
                        )
                        thumb_count += 1
                except Exception:
                    # Thumbnail generation should never break inference.
                    pass

        frame_index += 1

    cap.release()
    return jsonify(
        {
            "results": results,
            "baseline_threshold": float(profile.get("healthy_threshold", 0.5)),
            "dog_id": dog_id,
            "unhealthy_thumbnails": unhealthy_thumbnails,
        }
    )

@app.route("/set_normal_baseline", methods=["POST"])
def set_normal_baseline():
    """
    Update the digital twin baseline profile using a normal image.
    Expects:
      - file: uploaded image
      - dog_id: optional form field
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(file.filename))
    file.save(filepath)

    dog_id = request.form.get("dog_id", "default")
    profile = _get_or_create_profile(dog_id)

    _label, probs = predict_image_from_path(filepath)
    updated_profile = _update_profile_with_probs(profile, probs)
    return jsonify({"dog_id": dog_id, "profile": updated_profile})

@app.route("/set_normal_baseline_video", methods=["POST"])
def set_normal_baseline_video():
    """
    Update the digital twin baseline profile using a normal video.
    Expects:
      - file: uploaded video
      - dog_id: optional form field
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(file.filename))
    file.save(filepath)

    dog_id = request.form.get("dog_id", "default")
    profile = _get_or_create_profile(dog_id)

    cap = cv2.VideoCapture(filepath)
    if not cap.isOpened():
        return jsonify({"error": "Could not open video"}), 400

    interval_seconds = 1
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps is None or fps <= 0:
        fps = 25.0
    step_frames = max(1, int(round(fps * interval_seconds)))

    updated_profile = profile
    results_count = 0
    frame_index = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_index % step_frames == 0:
            _label, probs = predict_frame(frame)
            updated_profile = _update_profile_with_probs(updated_profile, probs, persist=False)
            results_count += 1

        frame_index += 1

    cap.release()
    _persist_profile(updated_profile)
    return jsonify({"dog_id": dog_id, "frames_used": results_count, "profile": updated_profile})

#
# Reporting + Map (MongoDB)
#

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "dog_skin_reports")
MONGODB_COLLECTION_NAME = os.getenv("MONGODB_COLLECTION_NAME", "reported_dogs")

def _get_reports_collection():
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    # Force a connection test early.
    client.admin.command("ping")
    return client[MONGODB_DB_NAME][MONGODB_COLLECTION_NAME]

def _parse_json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

@app.route("/api/report_dog", methods=["POST"])
def report_dog():
    """
    Expects JSON:
      - dog_id (optional)
      - disease (string or list of strings)
      - severity (Mild|Moderate|Severe)
      - image_base64 (optional, no data URL prefix)
      - image_mime (optional)
      - location: { latitude, longitude, accuracy? }
    """
    body = _parse_json_body()
    if not body:
        return jsonify({"error": "Invalid JSON body"}), 400

    disease = body.get("disease", "")
    severity = body.get("severity", "")
    dog_id = body.get("dog_id", body.get("dogId", "default"))

    location = body.get("location") or {}
    lat = location.get("latitude") if "latitude" in location else location.get("lat")
    lng = location.get("longitude") if "longitude" in location else location.get("lng")
    accuracy = location.get("accuracy")

    if not severity or severity not in {"Mild", "Moderate", "Severe"}:
        return jsonify({"error": "Invalid or missing severity"}), 400

    # Normalize disease into list for consistency.
    if isinstance(disease, str):
        disease_list = [disease] if disease.strip() else []
    elif isinstance(disease, list):
        disease_list = [str(x).strip() for x in disease if x]
    else:
        disease_list = []

    # Image is optional.
    image_base64 = body.get("image_base64")
    image_mime = body.get("image_mime") or "image/jpeg"
    notes = body.get("notes")

    doc = {
        "dog_id": dog_id,
        "disease": disease_list,
        "severity": severity,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    if lat is not None and lng is not None:
        try:
            lat_f = float(lat)
            lng_f = float(lng)
            doc["location_lat"] = lat_f
            doc["location_lng"] = lng_f
            doc["location_accuracy"] = float(accuracy) if accuracy is not None else None
            # GeoJSON point for potential geospatial queries.
            doc["location"] = {
                "type": "Point",
                "coordinates": [lng_f, lat_f],
            }
        except Exception:
            # Location is best-effort; ignore if conversion fails.
            pass

    if isinstance(image_base64, str) and image_base64.strip():
        doc["image_mime"] = image_mime
        doc["image_base64"] = image_base64

    if isinstance(notes, str) and notes.strip():
        doc["notes"] = notes.strip()

    try:
        collection = _get_reports_collection()
        result = collection.insert_one(doc)
        return jsonify({"ok": True, "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"error": "Could not store report in MongoDB", "details": str(e)}), 500


@app.route("/api/reported_dogs", methods=["GET"])
def get_reported_dogs():
    try:
        collection = _get_reports_collection()
        docs = list(collection.find({}).sort("createdAt", -1).limit(500))
    except Exception as e:
        return jsonify({"error": "Could not load reports from MongoDB", "details": str(e)}), 500

    out = []
    for d in docs:
        out.append(
            {
                "id": str(d.get("_id")),
                "disease": d.get("disease", []),
                "severity": d.get("severity"),
                "lat": d.get("location_lat"),
                "lng": d.get("location_lng"),
                "createdAt": d.get("createdAt"),
                "notes": d.get("notes", ""),
                "image_base64": d.get("image_base64"),
                "image_mime": d.get("image_mime", "image/jpeg"),
            }
        )
    return jsonify({"reports": out})


@app.route("/reports-map", methods=["GET"])
def reports_map():
    return render_template("reports_map.html")

if __name__ == "__main__":
    app.run(debug=True)
