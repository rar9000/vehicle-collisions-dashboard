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
                    layer.on("click", function () {
                        removeAllLabels(); 

                        console.log("Neighborhood clicked:", feature.properties.NH_NAME); 

                        if (layer.getTooltip()) {
                            layer.unbindTooltip();
                        }

                        let tooltip = layer.bindTooltip(feature.properties.NH_NAME, {
                            direction: "center",
                            className: "neighborhood-label",
                            permanent: true
                        });

                        tooltip.openTooltip();
                        tooltip.update(); 
                    });
                }
            }).addTo(map);

            map.fitBounds(neighborhoodLayer.getBounds());

            neighborhoodLayer.eachLayer(layer => layer.options.interactive = false);
        })
        .catch(error => console.error("Error loading neighborhoods:", error));

    fetch("../data/louisville_roads.geojson")
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function () {
                    return { color: "#000000", weight: 1.5, opacity: 1 };
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties.ROAD_NAME) {
                        layer.on("click", function () {
                            removeAllLabels();

                            console.log("Road clicked:", feature.properties.ROAD_NAME);

                            if (layer.getTooltip()) {
                                layer.unbindTooltip();
                            }

                            let tooltip = layer.bindTooltip(feature.properties.ROAD_NAME, {
                                direction: "center",
                                className: "road-label",
                                permanent: true
                            });

                            tooltip.openTooltip();
                            tooltip.update(); 
                        });
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error("Error loading roads:", error));

    fetch("../data/collisions/01-24-2025_crashes.csv")
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    let crashData = results.data;

                    crashData.forEach(crash => {
                        let lat = parseFloat(crash.Latitude);
                        let lon = parseFloat(crash.Longitude);
                        let incidentNumber = crash["IncidentID"] || "Unknown Incident"; 

                        if (!isNaN(lat) && !isNaN(lon)) {
                            let marker = L.circleMarker([lat, lon], {
                                radius: 6, 
                                fillColor: "red",
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).addTo(map); 

                            marker.bindPopup(`
                                <b>Incident Number:</b> ${incidentNumber}<br>
                            `, { autoClose: false });

                            marker.on("click", function () {
                                removeAllLabels(); 
                                this.openPopup();  
                            });
                        }
                    });
                }
            });
        })
        .catch(error => console.error("Error loading CSV:", error));

    function removeAllLabels() {
        map.eachLayer(layer => {
            if (layer.getTooltip()) {
                layer.unbindTooltip(); 
            }
            if (layer instanceof L.Popup) {
                layer.closePopup(); 
            }
        });
    }

    map.on("click", function () {
        console.log("Map clicked (empty space), removing labels.");
        removeAllLabels();
    });
});