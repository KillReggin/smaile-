from flask import Flask, request, jsonify
from flask_cors import CORS
from kafka import KafkaProducer
import redis
import json
import uuid

app = Flask(__name__)
CORS(app)

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

redis_client = redis.Redis(host="localhost", port=6379, db=0)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    task_id = str(uuid.uuid4())
    task = {
        "task_id": task_id,
        "prompt": data.get("prompt", ""),
        "category": data.get("category", "другое"),
        "length": data.get("length", "короткий"),
        "obscene": data.get("obscene", False),
    }
    print(f"📨 Принят запрос: prompt='{task['prompt']}' | category={task['category']} | task_id={task_id}")
    producer.send("joke_requests", task)
    return jsonify({"status": "queued", "task_id": task_id}), 202

@app.route("/result/<task_id>", methods=["GET"])
def result(task_id):
    raw = redis_client.get(f"joke_result:{task_id}")
    if raw:
        return jsonify(json.loads(raw)), 200
    return jsonify({"status": "pending"}), 202

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)