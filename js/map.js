
import { setupClickEvents } from './click.js';
import {
  loadCrashGeoData,
  loadCrashIncidentData,
  loadNeighborhoodGeoData
} from './dataLoader.js';
import {
  getCrashCountsByNeighborhood,
  calculateCrashRatePerPopulation,
  calculateCrashRatePerSquareMile,
  createIncidentLookup
} from './calculations.js';
import { createNeighborhoodPopup } from './popup.js';

const map = L.map("map").setView([38.2527, -85.7585], 11);

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

    const crashCounts = getCrashCountsByNeighborhood(crashIncidentData);
    const crashRatePop = calculateCrashRatePerPopulation(crashCounts, neighborhoodData);
    const crashRateArea = calculateCrashRatePerSquareMile(crashCounts, neighborhoodData);
    const incidentLookup = createIncidentLookup(crashIncidentData);

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
        const popup = createNeighborhoodPopup(props, crashCounts, crashRatePop, crashRateArea);

        layer.bindPopup(popup, {
          autoClose: false,
          closeOnClick: false
        });
      }
    }).addTo(map);

    map.fitBounds(neighborhoodLayer.getBounds());
    neighborhoodLayer.eachLayer(layer => layer.bringToBack());

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

export const mapRef = map;

export function resetMapView() {
  map.setView([38.2527, -85.7585], 11);
  map.closePopup();
  map.eachLayer(layer => {
    if (layer.closePopup) {
      layer.closePopup();
    }
  });
}