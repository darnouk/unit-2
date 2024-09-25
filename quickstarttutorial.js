// Initialize the map and set its view to a given geographical coordinates and zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a marker to the map at the given location
var marker = L.marker([51.5, -0.09]).addTo(map);

// Add a circle to the map
var circle = L.circle([51.508, -0.11], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 500
}).addTo(map);

// Add a polygon to the map
var polygon = L.polygon([
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047]
]).addTo(map);

// Bind popups to each element
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// Add a standalone popup
var popup = L.popup()
  .setLatLng([51.513, -0.09])
  .setContent("I am a standalone popup.")
  .openOn(map);

// Function to handle map clicks and show a popup at the clicked location
function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

// Register the click event to the map
map.on('click', onMapClick);
