import { setupClickEvents } from './click.js';

const map = L.map("map").setView([38.2527, -85.7585], 10);

L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
}).addTo(map);

let crashCounts = {};

fetch("../data/crashes/01_24_2025_crashes_incident.json")
    .then(res => res.json())
    .then(crashData => {
        crashData.forEach(crash => {
            const nh = crash.nh_name;
            if (nh) {
                crashCounts[nh] = (crashCounts[nh] || 0) + 1;
            }
        });

        fetch("../data/neighborhoods/nh_map.geojson")
            .then(res => res.json())
            .then(nhData => {
                const neighborhoodLayer = L.geoJSON(nhData, {
                    style: () => ({
                        color: "#000",
                        weight: 2,
                        opacity: 1,
                        fillColor: "red",
                        fillOpacity: 0.2
                    }),
                    onEachFeature: (feature, layer) => {
                        const props = feature.properties;
                        const name = props.nh_name;
                        const population = props.population || 0;
                        const squareMiles = props.square_miles || 1;
                        const crashes = crashCounts[name] || 0;

                        const crashRatePop = population ? ((crashes / population) * 1000).toFixed(2) : "N/A";
                        const crashRateArea = (crashes / squareMiles).toFixed(2);

                        const popup = `
                            <b>${name}</b><br>
                            Population: ${population.toLocaleString()}<br>
                            Area: ${squareMiles.toFixed(2)} mi²<br>
                            Crashes: ${crashes}<br>
                            Crash Rate (per 1,000 people): ${crashRatePop}<br>
                            Crash Rate (per sq mi): ${crashRateArea}
                        `;

                        layer.bindPopup(popup, {
                            autoClose: false,
                            closeOnClick: false
                        });

                        layer.on("click", () => {
                            highlightNeighborhood(layer, { zoom: false });
                        });
                    }
                }).addTo(map);

                map.fitBounds(neighborhoodLayer.getBounds());
                neighborhoodLayer.eachLayer(layer => layer.bringToBack());

                // Load crash points
                fetch("../data/crashes/01_24_2025_crashes_map.geojson")
                    .then(res => res.json())
                    .then(crashGeo => {
                        const crashLayer = L.geoJSON(crashGeo, {
                            pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
                                radius: 6,
                                fillColor: "red",
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            }),
                            onEachFeature: (feature, layer) => {
                                const id = feature.properties.incidentid || "Unknown";
                                layer.bindPopup(`<b>Incident Number:</b> ${id}`, {
                                    autoClose: false,
                                    closeOnClick: false
                                });
                            }
                        }).addTo(map);

                        crashLayer.eachLayer(layer => layer.bringToFront());

                        // Setup shared click behavior
                        setupClickEvents({ map, neighborhoodLayer, crashLayer });
                    });
            });
    });

// Needed globally for leaflet event clicks
let selectedNeighborhood = null;

function highlightNeighborhood(layer, { zoom = false } = {}) {
    if (selectedNeighborhood) {
        selectedNeighborhood.setStyle({ fillColor: "red" });
    }
    layer.setStyle({ fillColor: "blue" });
    selectedNeighborhood = layer;

    if (zoom) {
        map.fitBounds(layer.getBounds());
    }

    layer.openPopup();
}

export { highlightNeighborhood };