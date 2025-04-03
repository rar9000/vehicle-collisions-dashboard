// import popup builder for crash points
import { buildCrashPopup } from './popup.js'

// holds the map object
let mapRef = null

// holds the neighborhood shapes
let neighborhoodLayerRef = null

// holds the crash point markers
let crashLayerRef = null

// holds the crash incident data by ID
let incidentLookupRef = null

// keeps track of the selected neighborhood
let selectedNeighborhood = null

// highlight a neighborhood and optionally zoom to it
export function highlightNeighborhood(layer, options = { zoom: true }) {
  if (selectedNeighborhood) {
    selectedNeighborhood.setStyle({ fillColor: "red" }) // reset previous
  }
  layer.setStyle({ fillColor: "blue" }) // highlight new
  selectedNeighborhood = layer

  if (options.zoom && mapRef) {
    mapRef.fitBounds(layer.getBounds()) // zoom to bounds
  }

  layer.openPopup() // show popup
}

// zoom to a neighborhood by name
export function zoomToNeighborhood(nhName) {
  if (!neighborhoodLayerRef) return

  neighborhoodLayerRef.eachLayer(layer => {
    const props = layer.feature.properties
    if (props.nh_name === nhName) {
      highlightNeighborhood(layer, { zoom: true }) // match and highlight
    }
  })
}

// zoom to a crash point by ID and simulate a click
export function zoomToCrash(incidentID) {
  if (!crashLayerRef || !mapRef) return

  crashLayerRef.eachLayer(layer => {
    const props = layer.feature?.properties
    if (props?.incidentid === incidentID) {
      const latlng = layer.getLatLng()
      mapRef.setView(latlng, 16) // zoom to location
      layer.fire("click") // simulate click
    }
  })
}

// adds click and popup behavior to each crash marker
function bindCrashMarkerEvents(crashLayer) {
  if (!incidentLookupRef) return

  crashLayer.eachLayer(layer => {
    const props = layer.feature.properties
    const id = props.incidentid
    const lat = layer.getLatLng().lat
    const lon = layer.getLatLng().lng
    const lookup = incidentLookupRef[id]

    // default popup shown before loading full details
    layer.bindPopup(`<b>Incident Number:</b> ${id}<br><b>Weather:</b> Loading...`, {
      autoClose: false,
      closeOnClick: false
    })

    // on click, build full popup from popup.js
    layer.on("click", async () => {
      const popupContent = await buildCrashPopup({ id, lat, lon, lookup })
      layer.setPopupContent(popupContent)
    })
  })
}

// setup click behavior for neighborhoods and crash markers
export function setupClickEvents({ map, neighborhoodLayer, crashLayer, incidentLookup }) {
  mapRef = map
  neighborhoodLayerRef = neighborhoodLayer
  crashLayerRef = crashLayer
  incidentLookupRef = incidentLookup

  // enable click on neighborhoods
  neighborhoodLayerRef.eachLayer(layer => {
    layer.on("click", () => highlightNeighborhood(layer, { zoom: false }))
  })

  // enable click on crash points
  bindCrashMarkerEvents(crashLayer)
}

// click behavior for crash ID and neighborhood name in the list
export function enableCrashListClicks() {
  // click on crash ID
  document.querySelectorAll(".clickable-id").forEach(span => {
    span.addEventListener("click", () => {
      const id = parseInt(span.textContent)
      if (id) zoomToCrash(id)
    })
  })

  // click on neighborhood name
  document.querySelectorAll(".clickable-nh").forEach(span => {
    const nh = span.textContent
    span.addEventListener("click", () => {
      if (nh) zoomToNeighborhood(nh)
    })
  })
}

// clears the neighborhood highlight
export function clearNeighborhoodHighlight() {
  if (selectedNeighborhood) {
    selectedNeighborhood.setStyle({ fillColor: "red" })
    selectedNeighborhood = null
  }
}