// imports neighborhood popup builder
import { createNeighborhoodPopup } from './popup.js'

// imports setup function for click behavior
import { setupClickEvents } from './click.js'

// imports data loading functions
import {
  loadCrashGeoData,
  loadCrashIncidentData,
  loadNeighborhoodGeoData
} from './dataLoader.js'

// imports crash calculation functions
import {
  getCrashCountsByNeighborhood,
  calculateCrashRatePerPopulation,
  calculateCrashRatePerSquareMile,
  createIncidentLookup
} from './calculations.js'

// creates and centers the map on Louisville
const map = L.map("map").setView([38.2527, -85.7585], 11)

// adds a background tile layer to the map
L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
}).addTo(map)

// initializes all map data and layers
async function initMap() {
  try {
    // load all data at the same time
    const [crashIncidentData, neighborhoodData, crashGeoData] = await Promise.all([
      loadCrashIncidentData(),
      loadNeighborhoodGeoData(),
      loadCrashGeoData()
    ])

    // calculate crash data
    const crashCounts = getCrashCountsByNeighborhood(crashIncidentData)
    const crashRatePop = calculateCrashRatePerPopulation(crashCounts, neighborhoodData)
    const crashRateArea = calculateCrashRatePerSquareMile(crashCounts, neighborhoodData)

    // create lookup by crash ID
    const incidentLookup = createIncidentLookup(crashIncidentData)

    // create and add neighborhood layer to map
    const neighborhoodLayer = L.geoJSON(neighborhoodData, {
      style: () => ({
        color: "#000",          // border color
        weight: 2,              // border width
        opacity: 1,
        fillColor: "red",       // default fill
        fillOpacity: 0.2
      }),
      onEachFeature: (feature, layer) => {
        // build neighborhood popup with calculated data
        const popup = createNeighborhoodPopup(
          feature.properties,
          crashCounts,
          crashRatePop,
          crashRateArea
        )

        // attach the popup to the neighborhood
        layer.bindPopup(popup, {
          autoClose: false,
          closeOnClick: false
        })
      }
    }).addTo(map)

    // zoom the map to show all neighborhoods
    map.fitBounds(neighborhoodLayer.getBounds())

    // send neighborhoods to back so crashes appear on top
    neighborhoodLayer.eachLayer(layer => layer.bringToBack())

    // create crash point layer using circle markers
    const crashLayer = L.geoJSON(crashGeoData, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 6,
        fillColor: "red",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
      // we no longer handle popups here — click.js takes care of that
    }).addTo(map)

    // make sure crash points are visually above neighborhoods
    crashLayer.eachLayer(layer => layer.bringToFront())

    // enable click behavior for map interaction
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

// call the map initialization when page loads
initMap()

// export map reference for other files
export const mapRef = map

// resets map view and closes all popups
export function resetMapView() {
  map.setView([38.2527, -85.7585], 11)
  map.closePopup()
  map.eachLayer(layer => {
    if (layer.closePopup) {
      layer.closePopup()
    }
  })
}