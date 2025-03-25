import { setupClickEvents } from './click.js';
import {
  loadCrashGeoData,
  loadCrashIncidentData,
  loadNeighborhoodGeoData
} from './dataLoader.js';

const map = L.map("map").setView([38.2527, -85.7585], 10);

L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
}).addTo(map);

async function initMap() {
  try {
    const [crashIncidentData, neighborhoodData, crashGeoData] = await Promise.all([
      loadCrashIncidentData(),
      loadNeighborhoodGeoData(),
      loadCrashGeoData()
    ]);

    // Count crashes per neighborhood
    const crashCounts = {};
    crashIncidentData.forEach(crash => {
      const nh = crash.nh_name;
      if (nh) {
        crashCounts[nh] = (crashCounts[nh] || 0) + 1;
      }
    });

    // Prepare incidentID lookup for weather
    const incidentLookup = {};
    crashIncidentData.forEach(crash => {
      incidentLookup[crash.incidentid] = {
        lat: crash.latitude,
        lon: crash.longitude,
        timestamp: crash.timestamp
      };
    });

    // Neighborhood boundaries
    const neighborhoodLayer = L.geoJSON(neighborhoodData, {
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
        const crashRateArea = squareMiles ? (crashes / squareMiles).toFixed(2) : "N/A";

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
      }
    }).addTo(map);

    map.fitBounds(neighborhoodLayer.getBounds());
    neighborhoodLayer.eachLayer(layer => layer.bringToBack());

    // Crash points
    const crashLayer = L.geoJSON(crashGeoData, {
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

    // Unified click behavior
    setupClickEvents({
      map,
      neighborhoodLayer,
      crashLayer,
      incidentLookup
    });

  } catch (err) {
    console.error("Error initializing map:", err);
  }
}

initMap();