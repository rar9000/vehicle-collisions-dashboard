let mapRef = null;
let neighborhoodLayerRef = null;
let crashLayerRef = null;
let selectedLayer = null;

// Highlight a neighborhood layer
export function highlightNeighborhood(layer, options = { zoom: true }) {
    if (selectedLayer) {
        selectedLayer.setStyle({ fillColor: "red" });
    }
    layer.setStyle({ fillColor: "blue" });
    selectedLayer = layer;

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

// Zoom to crash point by incident ID
export function zoomToCrash(incidentID) {
    if (!crashLayerRef || !mapRef) return;

    crashLayerRef.eachLayer(layer => {
        const props = layer.feature.properties;
        if (props.incidentid === incidentID) {
            mapRef.setView(layer.getLatLng(), 16);
            layer.openPopup();
        }
    });
}

// Optional: initialize click bindings after crash and neighborhood layers are loaded
export function setupClickEvents({ map, neighborhoodLayer, crashLayer }) {
    mapRef = map;
    neighborhoodLayerRef = neighborhoodLayer;
    crashLayerRef = crashLayer;

    neighborhoodLayerRef.eachLayer(layer => {
        layer.on("click", () => highlightNeighborhood(layer, { zoom: false }));
    });
}