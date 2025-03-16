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
                        this.bringToBack(); 
                        console.log("Neighborhood clicked:", feature.properties.NH_NAME);

                        if (!layer.getPopup()) {
                            layer.bindPopup(
                                `<b>${feature.properties.NH_NAME}</b><br>
                                 Population: `,
                                { autoClose: false, closeOnClick: false }
                            ).openPopup();
                        }
                    });
                }
            }).addTo(map);

            map.fitBounds(neighborhoodLayer.getBounds());

            neighborhoodLayer.eachLayer(layer => layer.bringToBack());
        })
        .catch(error => console.error("Error loading neighborhoods:", error));

    fetch("../data/louisville_roads.geojson")
        .then(response => response.json())
        .then(data => {
            var roadLayer = L.geoJSON(data, {
                style: function () {
                    return { color: "#000000", weight: 1.5, opacity: 1 };
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties.ROAD_NAME) {
                        layer.on("click", function () {
                            this.bringToBack(); 
                            console.log("Road clicked:", feature.properties.ROAD_NAME);

                            if (!layer.getPopup()) {
                                layer.bindPopup(`<b>${feature.properties.ROAD_NAME}</b>`,
                                     { autoClose: false, closeOnClick: false }
                                ).openPopup();
                            }
                        });
                    }
                }
            }).addTo(map);

            roadLayer.eachLayer(layer => layer.bringToBack());
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
                    let crashLayer = L.layerGroup();

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
                            });

                            marker.on("click", function () {
                                this.bringToFront(); 
                                console.log("Crash clicked:", incidentNumber);

                                if (!marker.getPopup()) {
                                    marker.bindPopup(`<b>Incident Number:</b> ${incidentNumber}<br>`,
                                         { autoClose: false, closeOnClick: false }
                                    ).openPopup();
                                }
                            });

                            crashLayer.addLayer(marker);
                        }
                    });

                    crashLayer.addTo(map);
                    crashLayer.eachLayer(layer => layer.bringToFront());
                }
            });
        })
        .catch(error => console.error("Error loading CSV:", error));
});