
import { fetchWeather } from './weather.js';

let mapRef = null;
let neighborhoodLayerRef = null;
let crashLayerRef = null;
let incidentLookupRef = null;
let selectedNeighborhood = null;

// Highlight a neighborhood layer
export function highlightNeighborhood(layer, options = { zoom: true }) {
    if (selectedNeighborhood) {
        selectedNeighborhood.setStyle({ fillColor: "red" });
    }
    layer.setStyle({ fillColor: "blue" });
    selectedNeighborhood = layer;

    if (options.zoom && mapRef) {
        mapRef.fitBounds(layer.getBounds());
    }

    layer.openPopup();
}

// Zoom and highlight a neighborhood by name
export function zoomToNeighborhood(nhName) {
    if (!neighborhoodLayerRef) return;

    neighborhoodLayerRef.eachLayer(layer => {
        const props = layer.feature.properties;
        if (props.nh_name === nhName) {
            highlightNeighborhood(layer, { zoom: true });
        }
    });
}

// Zoom to crash point by incident ID and simulate click
export function zoomToCrash(incidentID) {
    if (!crashLayerRef || !mapRef) return;

    crashLayerRef.eachLayer(layer => {
        const props = layer.feature?.properties;
        if (props?.incidentid === incidentID) {
            const latlng = layer.getLatLng();
            mapRef.setView(latlng, 16);
            layer.fire("click");
        }
    });
}

// Attach click and popup behavior to crash points
function bindCrashMarkerEvents(crashLayer) {
    if (!incidentLookupRef) return;

    crashLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        const id = props.incidentid;
        const lat = layer.getLatLng().lat;
        const lon = layer.getLatLng().lng;
        const lookup = incidentLookupRef[id];

        let popupContent = `<b>Incident Number:</b> ${id}<br><b>Weather:</b> Loading...`;
        layer.bindPopup(popupContent, {
            autoClose: false,
            closeOnClick: false
        });

        layer.on("click", async () => {
            if (lookup) {
              const weather = await fetchWeather(lat, lon, lookup.timestamp);
          
              // Format fields from the incident lookup
              const killed = lookup.numberkilled ?? "0";
              const injured = lookup.numberinjured ?? "0";
              const hitAndRun = lookup.hitandrun === true ? "Yes" : "No";
          
              // Format time from timestamp
              const date = new Date(lookup.timestamp);
              const hours = date.getHours();
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const hour12 = hours % 12 || 12;
              const timeFormatted = `${hour12}:${minutes} ${ampm}`;
          
              // Handle neighborhood name
              const neighborhood = lookup.nh_name?.trim() || "No Neighborhood";
          
              // Build popup content
              layer.setPopupContent(`
                <b>Incident Number:</b> ${id}<br>
                <b>Time:</b> ${timeFormatted}<br>
                <b>Neighborhood:</b> ${neighborhood}<br>
                <b>Killed:</b> ${killed}<br>
                <b>Injured:</b> ${injured}<br>
                <b>Hit & Run:</b> ${hitAndRun}<br>
                <b>Weather:</b> ${weather}
              `);
            } else {
              layer.setPopupContent(`
                <b>Incident Number:</b> ${id}<br>
                <b style="color:red;">Weather data unavailable</b>
              `);
            }
        });
    });
}

// Initialize click after crash and neighborhood layers are loaded
export function setupClickEvents({ map, neighborhoodLayer, crashLayer, incidentLookup }) {
    mapRef = map;
    neighborhoodLayerRef = neighborhoodLayer;
    crashLayerRef = crashLayer;
    incidentLookupRef = incidentLookup;

    // Neighborhood clicks
    neighborhoodLayerRef.eachLayer(layer => {
        layer.on("click", () => highlightNeighborhood(layer, { zoom: false }));
    });

    // Crash marker clicks 
    bindCrashMarkerEvents(crashLayer);
}

export function enableCrashListClicks() {
    document.querySelectorAll(".clickable-id").forEach(span => {
        span.addEventListener("click", () => {
            const id = parseInt(span.textContent);
            if (id) zoomToCrash(id);
        });
    });

    document.querySelectorAll(".clickable-nh").forEach(span => {
        const nh = span.textContent;
        span.addEventListener("click", () => {
            if (nh) zoomToNeighborhood(nh);
        });
    });
}

export function clearNeighborhoodHighlight() {
    if (selectedNeighborhood) {
      selectedNeighborhood.setStyle({ fillColor: "red" });
      selectedNeighborhood = null;
    }
}
