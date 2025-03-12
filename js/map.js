
document.addEventListener("DOMContentLoaded", function () {
    var map = L.map("map").setView([38.2527, -85.7585], 12);

    L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
}).addTo(map);

    fetch("../data/louisville_neighborhoods.geojson")
        .then(response => response.json())
        .then(data => {
            var neighborhoodLayer = L.geoJSON(data, {
                style: function () {
                    return {
                        color: "#000000",   
                        weight: 2,          
                        opacity: 1,
                        fillColor: "#ffffff",  
                        fillOpacity: 0.2,  
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.options.interactive = true;

                    layer.bindTooltip(feature.properties.NH_NAME, {
                        direction: "center",
                        className: "neighborhood-label",
                        sticky: false, 
                        interactive: false 
                    });

                    layer.on("mouseover", function () {
                        this.openTooltip();
                        this.setStyle({ fillOpacity: 0.4 }); 
                    });

                    layer.on("mouseout", function () {
                        this.closeTooltip();
                        this.setStyle({ fillOpacity: 0.2 });
                    });
                }
            }).addTo(map);

            map.fitBounds(neighborhoodLayer.getBounds());
        })
        .catch(error => console.error("Error loading GeoJSON:", error));

    fetch("../data/louisville_roads.geojson")
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function () {
                return {
                    color: "#000000",  
                    weight: 1.5,      
                    opacity: 1
                };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties.ROAD_NAME) {
                    layer.bindTooltip(feature.properties.ROAD_NAME, {
                        permanent: false,
                        direction: "center",
                        className: "road-label",
                    });
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error("Error loading roads:", error));

    fetch("../data/louisville_neighborhoods.geojson")
    .then(response => response.json())
    .then(data => {
        var outerBounds = [
            [-90, -180],  
            [90, 180]     
        ];

        var maskPolygon = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-85.9, 38.0],  
                        [-85.5, 38.0],
                        [-85.5, 38.6],
                        [-85.9, 38.6],
                        [-85.9, 38.0]  
                    ],
                    ...data.features.map(feature => feature.geometry.coordinates).flat()
                ]
            }
        };

        L.geoJSON(maskPolygon, {
            style: {
                color: "none",  
                weight: 0,
                fillColor: "white", 
                fillOpacity: 1     
            }
        }).addTo(map);
    })
    .catch(error => console.error("Error creating mask overlay:", error));









});

