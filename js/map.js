document.addEventListener("DOMContentLoaded", function () {
    var map = L.map("map").setView([38.2527, -85.7585], 10);
    
    L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
    }).addTo(map);

    fetch("../data/neighborhoods/nh_map.geojson")
        .then(response => response.json())
        .then(data => {
            var neighborhoodLayer = L.geoJSON(data, {
                style: function () {
                    return {
                        color: "#000000",
                        weight: 2,
                        opacity: 1,
                        fillColor: "red",
                        fillOpacity: 0.2,
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.on("click", function () {
                        this.bringToBack(); 
                        console.log("Neighborhood clicked:", feature.properties.nh_name);

                        if (!layer.getPopup()) {
                            layer.bindPopup(
                                `<b>${feature.properties.nh_name}</b><br>
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

        fetch("../data/crashes/01_24_2025_crashes_map.geojson")
        .then(response => response.json())
        .then(data => {
            let crashLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: "red",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                },
                onEachFeature: function (feature, layer) {
                    const incidentNumber = feature.properties["incidentid"] || "Unknown Incident";
    
                    layer.on("click", function () {
                        this.bringToFront();
    
                        if (!layer.getPopup()) {
                            layer.bindPopup(
                                `<b>Incident Number:</b> ${incidentNumber}<br>`,
                                { autoClose: false, closeOnClick: false }
                            ).openPopup();
                        }
                    });
                }
            }).addTo(map);
    
            crashLayer.eachLayer(layer => layer.bringToFront());
        })
        .catch(error => console.error("Error loading crash GeoJSON:", error));

});