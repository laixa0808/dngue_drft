// Dummy ML prediction mapping with actual barangay names from the GeoJSON
const mlRiskPrediction = {
  "San Buenaventura": 45,
  "Sta. Catalina": 32,
  "Bagong Bayan": 18,
  "Bagong Pook": 25,
  "I-A": 12,
  "I-B": 8,
  "II-A": 15,
  "II-B": 22,
  "II-C": 35,
  "II-D": 28,
  "II-E": 19,
  "II-F": 11,
  "III-A": 42,
  "III-B": 38,
  "III-C": 33,
  "III-D": 27,
  "III-E": 31,
  "III-F": 24,
  "IV-A": 16,
  "IV-B": 13,
  "IV-C": 9,
  "San Lucas 1": 7,
  "V-A": 14,
  "V-B": 21,
  "V-C": 17,
  "V-D": 10,
  "VI-A": 26,
  "VI-B": 29,
  "VI-D": 20,
  "VI-E": 23,
  "VII-A": 34,
  "VII-B": 30,
  "VII-C": 25,
  "VII-D": 18,
  "VII-E": 22,
  "Santo Cristo": 36,
  "San Roque": 40,
  "Del Remedio": 44,
  "San Francisco": 37,
  "Concepcion": 39,
  "Santa Isabel": 41,
  "San Jose": 43,
  "San Rafael": 35,
  "San Nicolas": 28,
  "Santa Monica": 31
};

// Color scale function
function getColor(d) {
  return d > 50 ? '#d73027' :
         d > 30 ? '#fc8d59' :
         d > 15 ? '#fee08b' :
         d > 5  ? '#d9ef8b' :
                  '#91cf60';
}

// Initialize map
const map = L.map('map').setView([14.07, 121.32], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

// Get GeoJSON data from the script tag
const geojsonScript = document.getElementById('geojson-data');
const geojsonData = JSON.parse(geojsonScript.textContent);

// Add GeoJSON layer to map
L.geoJson(geojsonData, {
  style: feature => {
    const brgy = feature.properties.name;
    const value = mlRiskPrediction[brgy] || 0;
    return {
      color: 'black',
      weight: 1,
      fillColor: getColor(value),
      fillOpacity: 0.7
    };
  },
  onEachFeature: (feature, layer) => {
    const brgy = feature.properties.name;
    const value = mlRiskPrediction[brgy] || 0;
    layer.bindPopup(`<strong>${brgy}</strong><br>Dengue Cases: ${value}`);
  }
}).addTo(map);