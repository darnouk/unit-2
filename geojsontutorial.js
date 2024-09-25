// Initialize the map and set its view to a given geographical coordinates and zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Sample GeoJSON data
var geojsonFeature = {
  "type": "Feature",
  "properties": {
    "name": "Coors Field",
    "amenity": "Baseball Stadium",
    "popupContent": "This is where the Rockies play!"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-104.99404, 39.75621]
  }
};

// Add the GeoJSON feature to the map
L.geoJSON(geojsonFeature).addTo(map);

// Style settings for GeoJSON features
var myLines = [{
  "type": "LineString",
  "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
  "type": "LineString",
  "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
  "color": "#ff7800",
  "weight": 5,
  "opacity": 0.65
};

// Add styled GeoJSON to the map
L.geoJSON(myLines, {
  style: myStyle
}).addTo(map);

// GeoJSON points with different marker icons based on their properties
var someFeatures = [{
  "type": "Feature",
  "properties": {
    "party": "Republican"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-104.99404, 39.75621]
  }
}, {
  "type": "Feature",
  "properties": {
    "party": "Democrat"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-104.98404, 39.74621]
  }
}];

// Custom pointToLayer to change markers based on feature properties
L.geoJSON(someFeatures, {
  pointToLayer: function (feature, latlng) {
    var markerStyle;
    if (feature.properties.party === "Republican") {
      markerStyle = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
        iconSize: [38, 95], // size of the icon
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        shadowSize: [50, 64], // size of the shadow
        shadowAnchor: [4, 62]  // the same for the shadow
      });
    } else {
      markerStyle = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76],
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        shadowSize: [50, 64],
        shadowAnchor: [4, 62]
      });
    }
    return L.marker(latlng, { icon: markerStyle });
  }
}).addTo(map);

// Click event handler with popup for GeoJSON features
function onEachFeature(feature, layer) {
  // If this feature has a property named "popupContent", bind a popup
  if (feature.properties && feature.properties.popupContent) {
    layer.bindPopup(feature.properties.popupContent);
  }
}

// GeoJSON object with multiple features
var geojson = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "name": "Coors Field",
      "amenity": "Baseball Stadium",
      "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
    }
  }, {
    "type": "Feature",
    "properties": {
      "name": "Busch Field",
      "amenity": "Baseball Stadium",
      "popupContent": "This is where the Cardinals play!"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-104.98404, 39.74621]
    }
  }]
};

// Add GeoJSON with click event handler
L.geoJSON(geojson, {
  onEachFeature: onEachFeature
}).addTo(map);
