// Imports the fetchWeather function from weather.js
import { fetchWeather } from './weather.js'

// Stores reference to the map object
let mapRef = null
// Stores reference to the neighborhood geojson layer
let neighborhoodLayerRef = null
// Stores reference to the crash point geojson layer
let crashLayerRef = null
// Stores reference to the crash incident data for lookup
let incidentLookupRef = null
// Stores the currently selected neighborhood layer
let selectedNeighborhood = null

// Highlights a neighborhood layer and zooms if needed
export function highlightNeighborhood(layer, options = { zoom: true }) {
  if (selectedNeighborhood) {
    selectedNeighborhood.setStyle({ fillColor: "red" }) // Reset previously selected neighborhood
  }
  layer.setStyle({ fillColor: "blue" }) // Highlight new neighborhood
  selectedNeighborhood = layer

  if (options.zoom && mapRef) {
    mapRef.fitBounds(layer.getBounds()) // Zoom to the neighborhood bounds
  }

  layer.openPopup() // Show the popup
}

// Zooms and highlights a neighborhood by name
export function zoomToNeighborhood(nhName) {
  if (!neighborhoodLayerRef) return

  neighborhoodLayerRef.eachLayer(layer => {
    const props = layer.feature.properties
    if (props.nh_name === nhName) {
      highlightNeighborhood(layer, { zoom: true }) // Highlight matching neighborhood
    }
  })
}

// Zooms to a crash point by ID and simulates a click
export function zoomToCrash(incidentID) {
  if (!crashLayerRef || !mapRef) return

  crashLayerRef.eachLayer(layer => {
    const props = layer.feature?.properties
    if (props?.incidentid === incidentID) {
      const latlng = layer.getLatLng()
      mapRef.setView(latlng, 16) // Zoom to the crash location
      layer.fire("click") // Simulate clicking the marker
    }
  })
}

// Binds click and popup behavior to crash markers
function bindCrashMarkerEvents(crashLayer) {
  if (!incidentLookupRef) return

  crashLayer.eachLayer(layer => {
    const props = layer.feature.properties
    const id = props.incidentid
    const lat = layer.getLatLng().lat
    const lon = layer.getLatLng().lng
    const lookup = incidentLookupRef[id]

    let popupContent = `<b>Incident Number:</b> ${id}<br><b>Weather:</b> Loading...`
    layer.bindPopup(popupContent, {
      autoClose: false,
      closeOnClick: false
    })

    // On marker click load full popup info
    layer.on("click", async () => {
      if (lookup) {
        const weather = await fetchWeather(lat, lon, lookup.timestamp)

        const killed = lookup.numberkilled ?? "0"
        const injured = lookup.numberinjured ?? "0"
        const hitAndRun = lookup.hitandrun === true ? "Yes" : "No"

        const date = new Date(lookup.timestamp)
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const hour12 = hours % 12 || 12
        const timeFormatted = `${hour12}:${minutes} ${ampm}`

        const neighborhood = lookup.nh_name?.trim() || "No Neighborhood"

        layer.setPopupContent(`
          <b>Incident Number:</b> ${id}<br>
          <b>Time:</b> ${timeFormatted}<br>
          <b>Neighborhood:</b> ${neighborhood}<br>
          <b>Killed:</b> ${killed}<br>
          <b>Injured:</b> ${injured}<br>
          <b>Hit & Run:</b> ${hitAndRun}<br>
          <b>Weather:</b> ${weather}
        `)
      } else {
        layer.setPopupContent(`
          <b>Incident Number:</b> ${id}<br>
          <b style="color:red;">Weather data unavailable</b>
        `)
      }
    })
  })
}

// Sets up click events on crash markers and neighborhood shapes
export function setupClickEvents({ map, neighborhoodLayer, crashLayer, incidentLookup }) {
  mapRef = map
  neighborhoodLayerRef = neighborhoodLayer
  crashLayerRef = crashLayer
  incidentLookupRef = incidentLookup

  // Bind click to each neighborhood shape
  neighborhoodLayerRef.eachLayer(layer => {
    layer.on("click", () => highlightNeighborhood(layer, { zoom: false }))
  })

  // Bind click behavior to each crash point
  bindCrashMarkerEvents(crashLayer)
}

// Enables clickable behavior for elements in the list view
export function enableCrashListClicks() {
  // Link crash IDs to zoom on map
  document.querySelectorAll(".clickable-id").forEach(span => {
    span.addEventListener("click", () => {
      const id = parseInt(span.textContent)
      if (id) zoomToCrash(id)
    })
  })

  // Link neighborhood names to zoom on map
  document.querySelectorAll(".clickable-nh").forEach(span => {
    const nh = span.textContent
    span.addEventListener("click", () => {
      if (nh) zoomToNeighborhood(nh)
    })
  })
}

// Clears highlight from selected neighborhood
export function clearNeighborhoodHighlight() {
  if (selectedNeighborhood) {
    selectedNeighborhood.setStyle({ fillColor: "red" })
    selectedNeighborhood = null
  }
}