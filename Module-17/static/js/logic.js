// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features,stepsjs.features,boundariesjs,orogensjs,platesjs);
});

function createFeatures(earthquakeData,s,b,o,p) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>Magnitude: " + "<strong>" + feature.properties.mag  + "</strong>" +
      "</h3><p>Time: " + "<strong>" + new Date(feature.properties.time) + "</strong>" + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  var steps = L.geoJSON(s, {
    onEachFeature: onEachFeature
  });

  var boundaries = L.geoJSON(b);
  var orogens = L.geoJSON(o);
  var plates = L.geoJSON(p);
  // var steps = L.geoJSON(s);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes,boundaries,orogens,plates,steps);
}

function createMap(earthquakes,boundaries,orogens,plates,steps){
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var terrainmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.mapbox-terrain-v2",
    accessToken: API_KEY
  });
    
  // Define a baseMaps object to hold our base layers
    var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellitemap,
    "Terrain": terrainmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Boundaries": boundaries,
    "Orogens": orogens,
    "Plates": plates,
    "Steps": steps
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [satellitemap, earthquakes, boundaries]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps,{
    collapsed: false
  }).addTo(myMap);
};
