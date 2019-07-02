// Unit 17 Assigment - Visualizing Data with Leaflet
// @version 1.0
// @author Martha Meses

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features,stepsjs,boundariesjs,orogensjs,platesjs);
});

function createFeatures(earthquakeData,s,b,o,p) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p align='left'>Magnitude: " + "<strong>" + feature.properties.mag  + "</strong><br>" +
      "Time: " + "<strong>" + new Date(feature.properties.time) + "</strong></p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  var earthquakesMag = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature,latylong) {
      magnitudes = [{"coordinates":feature.geometry.coordinates, "mag":feature.properties.mag}];
      for (var i = 0; i < magnitudes.length; i++) {
          var color = "";
          if (magnitudes[i].mag >= 5) {
            color = "red";
          }
          else if (magnitudes[i].mag  > 4) {
            color = "orange";  
          }
          else if (magnitudes[i].mag  > 3) {
            color = "#ffd133";
          }
          else if (magnitudes[i].mag > 2) {
            color = "yellow";  
          }
          else if (magnitudes[i].mag > 1) {
            color = "#daf7a6";
          }
          else {
            color = "green";
          }
       }
      return L.circleMarker(latylong, {
				radius: feature.properties.mag*2,
		 		fillColor: color,
		 		color: "#000",
		 		weight: 1,
				opacity: 1,
		 		fillOpacity: 0.8
			}).bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p align='left'>Magnitude: " + "<strong>" + feature.properties.mag  + "</strong><br>" +
      "Time: " + "<strong>" + new Date(feature.properties.time) + "</strong></p>");
    }

  });

  var steps = L.geoJSON(s, {
    onEachFeature: onEachFeature
  });
  var boundaries = L.geoJSON(b);
  var orogens = L.geoJSON(o);
  var plates = L.geoJSON(p);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes,earthquakesMag,boundaries,orogens,plates,steps);
}

function createMap(earthquakes,earthquakesMag,boundaries,orogens,plates,steps){
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

  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Earthquakes Mag": earthquakesMag,
    "Boundaries": boundaries,
    "Orogens": orogens,
    "Plates": plates,
    "Steps": steps
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [39.6727509,-31.1202068],
    zoom: 2.6,
    layers: [satellitemap, earthquakes, boundaries]
  });



  // Set up the legend
  function getColor(d) {
      return d === '0 - 1'  ? "green" :
              d === '1 - 2'  ? "#daf7a6" :
              d === '2 - 3' ? "yellow" :
              d === '3 - 4' ? "#ffd133" :
              d === '4 - 5' ? "orange" :
                            "red";
  }

  legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend');
      labels = ['<strong>Magnitudes</strong><br>'],
      categories = ['0 - 1','1 - 2','2 - 3','3 - 4','4 - 5','5+'];;

      for (var i = 0; i < categories.length; i++) {
              div.innerHTML += 
              labels.push(
                  '<i style="background: '+ getColor(categories[i]) + '"></i> ' +
              (categories[i] ? categories[i] : '+'));

          }
          div.innerHTML = labels.join('<br>');
      return div;
  }; 

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps,{
    collapsed: false
  }).addTo(myMap);

  myMap.on('overlayadd',function(e){
    if (e.name === "Earthquakes Mag"){
      legend.addTo(myMap);
    }

  });

  myMap.on('overlayremove',function(e){
    if (e.name === "Earthquakes Mag"){
      legend.remove(myMap);
    }
  });
};