from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

@app.route("/")
def index():
    # Read the GeoJSON file
    geojson_path = os.path.join(app.root_path, 'templates', 'SAN_PABLO_MAP.geojson')
    with open(geojson_path, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)
    return render_template("index.html", geojson_data=geojson_data)

@app.route("/geojson")
def get_geojson():
    # Alternative route to serve GeoJSON as API endpoint
    geojson_path = os.path.join(app.root_path, 'templates', 'SAN_PABLO_MAP.geojson')
    with open(geojson_path, 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)
    return jsonify(geojson_data)

if __name__ == "__main__":
    app.run(debug=True)
