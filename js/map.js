// Imports click behavior setup from click.js
import { setupClickEvents } from './click.js'

// Imports functions for loading data files
import {
  loadCrashGeoData,
  loadCrashIncidentData,
  loadNeighborhoodGeoData
} from './dataLoader.js'

// Imports functions for counting and calculating crash rates
import {
  getCrashCountsByNeighborhood,
  calculateCrashRatePerPopulation,
  calculateCrashRatePerSquareMile,
  createIncidentLookup
} from './calculations.js'

// Imports function to create neighborhood popup content
import { createNeighborhoodPopup } from './popup.js'

// Creates the map and centers it on the city
const map = L.map("map").setView([38.2527, -85.7585], 11)

// Adds a tile layer to the map for background styling
L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
}).addTo(map)

// Loads all data and builds map layers
async function initMap() {
  try {
    // Loads crash incident data neighborhood shapes and crash points
    const [crashIncidentData, neighborhoodData, crashGeoData] = await Promise.all([
      loadCrashIncidentData(),
      loadNeighborhoodGeoData(),
      loadCrashGeoData()
    ])

    // Gets crash totals for each neighborhood
    const crashCounts = getCrashCountsByNeighborhood(crashIncidentData)

    // Calculates crash rate per population
    const crashRatePop = calculateCrashRatePerPopulation(crashCounts, neighborhoodData)

    // Calculates crash rate per square mile
    const crashRateArea = calculateCrashRatePerSquareMile(crashCounts, neighborhoodData)

    // Creates a lookup for crash incident details by ID
    const incidentLookup = createIncidentLookup(crashIncidentData)

    // Adds neighborhood shapes to the map
    const neighborhoodLayer = L.geoJSON(neighborhoodData, {
      style: () => ({
        color: "#000",
        weight: 2,
        opacity: 1,
        fillColor: "red",
        fillOpacity: 0.2
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties

        // Builds popup for each neighborhood using crash data
        const popup = createNeighborhoodPopup(props, crashCounts, crashRatePop, crashRateArea)

        // Attaches popup to the layer
        layer.bindPopup(popup, {
          autoClose: false,
          closeOnClick: false
        })
      }
    }).addTo(map)

    // Zooms map to fit all neighborhood shapes
    map.fitBounds(neighborhoodLayer.getBounds())

    // Sends neighborhood shapes to the back so crash points appear on top
    neighborhoodLayer.eachLayer(layer => layer.bringToBack())

    // Adds crash points to the map using circle markers
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
        const id = feature.properties.incidentid || "Unknown"

        // Adds a basic popup showing the crash ID
        layer.bindPopup(`<b>Incident Number:</b> ${id}`, {
          autoClose: false,
          closeOnClick: false
        })
      }
    }).addTo(map)

    // Makes sure crash points show above neighborhoods
    crashLayer.eachLayer(layer => layer.bringToFront())

    // Enables click behavior for map layers
    setupClickEvents({
      map,
      neighborhoodLayer,
      crashLayer,
      incidentLookup
    })

  } catch (err) {
    console.error("Error initializing map", err)
  }
}

// Calls the map initialization function when the page loads
initMap()

// Exports map reference for other files to use
export const mapRef = map

// Resets the map to its starting view and closes all popups
export function resetMapView() {
  map.setView([38.2527, -85.7585], 11)
  map.closePopup()
  map.eachLayer(layer => {
    if (layer.closePopup) {
      layer.closePopup()
    }
  })
}