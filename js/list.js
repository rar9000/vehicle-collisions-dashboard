// Imports functions to load crash data and population data
import {
  loadCrashIncidentData,
  loadPopulationSqMilesData
} from './dataLoader.js'

// Imports function to count crashes per neighborhood
import { getCrashCountsByNeighborhood } from './calculations.js'

// Imports functions to zoom to crash or neighborhood
import { zoomToCrash, zoomToNeighborhood } from './click.js'

// Gets the list element from the page
const crashList = document.getElementById("list")

// Caches crash and neighborhood data
let cachedCrashes = []
let cachedNeighborhoods = []

// Builds the list based on crash data
async function initList(filterName = "") {
  try {
    // Load data if not already cached
    if (!cachedCrashes.length || !cachedNeighborhoods.length) {
      cachedCrashes = await loadCrashIncidentData()
      cachedNeighborhoods = await loadPopulationSqMilesData()
    }

    // Clears the list before adding new items
    crashList.innerHTML = ""

    // Gets number of crashes per neighborhood
    const crashCounts = getCrashCountsByNeighborhood(cachedCrashes)

    // Gets all neighborhood names in alphabetical order
    const allNeighborhoods = cachedNeighborhoods.map(n => n.nh_name).sort()

    // Creates a crash list for each neighborhood
    const crashMap = {}
    allNeighborhoods.forEach(nh => crashMap[nh] = [])

    // Stores crashes that have no neighborhood
    const noNeighborhoodCrashes = []

    // Assigns each crash to its neighborhood group
    cachedCrashes.forEach(crash => {
      const nh = crash.nh_name?.trim()
      if (nh && crashMap.hasOwnProperty(nh)) {
        crashMap[nh].push(crash)
      } else {
        noNeighborhoodCrashes.push(crash)
      }
    })

    // Loops through each neighborhood to build its crash list
    allNeighborhoods.forEach(nh => {
      if (filterName && !nh.toLowerCase().includes(filterName.toLowerCase())) return

      const incidents = crashMap[nh]

      if (incidents.length > 0) {
        incidents.forEach(crash => {
          const li = document.createElement("li")

          const idSpan = document.createElement("span")
          idSpan.textContent = crash.incidentid
          idSpan.classList.add("clickable-id")
          idSpan.style.textDecoration = "underline"
          idSpan.style.cursor = "pointer"
          idSpan.addEventListener("click", () => zoomToCrash(crash.incidentid))

          const nhSpan = document.createElement("span")
          nhSpan.textContent = nh
          nhSpan.classList.add("clickable-nh")
          nhSpan.style.textDecoration = "underline"
          nhSpan.style.cursor = "pointer"
          nhSpan.addEventListener("click", () => zoomToNeighborhood(nh))

          const killed = Number(crash.numberkilled)
          if (killed > 0) {
            li.style.color = "red"
            li.style.fontWeight = "bold"
          }

          li.append("Crash ID ", idSpan, " — ", nhSpan)
          crashList.appendChild(li)
        })
      } else {
        // Handles neighborhoods with zero crashes
        const li = document.createElement("li")
        const nhSpan = document.createElement("span")
        nhSpan.textContent = nh
        nhSpan.classList.add("clickable-nh")
        nhSpan.style.textDecoration = "underline"
        nhSpan.style.cursor = "pointer"
        nhSpan.addEventListener("click", () => zoomToNeighborhood(nh))

        li.innerHTML = `Crash ID <span style="color:#888;">00000000</span> — `
        li.appendChild(nhSpan)
        crashList.appendChild(li)
      }
    })

    // Adds crashes with no neighborhood to the list
    noNeighborhoodCrashes.forEach(crash => {
      if (filterName && !"no neighborhood".includes(filterName.toLowerCase())) return

      const li = document.createElement("li")

      const idSpan = document.createElement("span")
      idSpan.textContent = crash.incidentid
      idSpan.classList.add("clickable-id")
      idSpan.style.textDecoration = "underline"
      idSpan.style.cursor = "pointer"
      idSpan.addEventListener("click", () => zoomToCrash(crash.incidentid))

      const nhSpan = document.createElement("span")
      nhSpan.textContent = "no neighborhood"

      const killed = Number(crash.numberkilled)
      if (killed > 0) {
        li.style.color = "red"
        li.style.fontWeight = "bold"
      }

      li.append("Crash ID ", idSpan, " — ", nhSpan)
      crashList.appendChild(li)
    })

  } catch (err) {
    console.error("Error initializing crash list", err)
  }
}

// Runs the list builder on page load
initList()

// Exports the list function for use in other files
export { initList }