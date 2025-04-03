// Imports functions to load crash and population data
import {
  loadCrashIncidentData,
  loadPopulationSqMilesData
} from './dataLoader.js'

// Imports function to count crashes per neighborhood
import { getCrashCountsByNeighborhood } from './calculations.js'

// Imports click handlers for IDs and neighborhood names
import { enableCrashListClicks } from './click.js'

// Gets references to HTML elements
const crashList = document.getElementById("list")        // where crash items are listed
const counter = document.getElementById("counter")       // where total crash count appears
const noResultsMessage = document.getElementById("noResults")  // message for "not found"

// Cache crash and neighborhood data to avoid reloading
let cachedCrashes = []
let cachedNeighborhoods = []

// Builds the list based on crashes and search input
async function initList(filterName = "") {
  try {
    // Load data if needed
    if (!cachedCrashes.length || !cachedNeighborhoods.length) {
      cachedCrashes = await loadCrashIncidentData()
      cachedNeighborhoods = await loadPopulationSqMilesData()
    }

    // Clear current list and message
    crashList.innerHTML = ""
    noResultsMessage.textContent = ""

    // Count crashes per neighborhood
    const crashCounts = getCrashCountsByNeighborhood(cachedCrashes)

    // Get alphabetical list of neighborhood names
    const allNeighborhoods = cachedNeighborhoods.map(n => n.nh_name).sort()

    // Map to group crashes by neighborhood
    const crashMap = {}
    allNeighborhoods.forEach(nh => crashMap[nh] = [])

    // Separate list for crashes with no neighborhood
    const noNeighborhoodCrashes = []

    // Assign each crash to its neighborhood
    cachedCrashes.forEach(crash => {
      const nh = crash.nh_name?.trim()
      if (nh && crashMap.hasOwnProperty(nh)) {
        crashMap[nh].push(crash)
      } else {
        noNeighborhoodCrashes.push(crash)
      }
    })

    // Track unique crash IDs for counter
    const uniqueCrashIds = new Set()

    // Add each neighborhood to the list
    allNeighborhoods.forEach(nh => {
      // Apply filter if set
      if (filterName && !nh.toLowerCase().includes(filterName.toLowerCase())) return

      const incidents = crashMap[nh]

      if (incidents.length > 0) {
        // Add each crash in this neighborhood
        incidents.forEach(crash => {
          const li = document.createElement("li")

          const idSpan = document.createElement("span")
          idSpan.textContent = crash.incidentid
          idSpan.classList.add("clickable-id")
          idSpan.style.textDecoration = "underline"
          idSpan.style.cursor = "pointer"

          const nhSpan = document.createElement("span")
          nhSpan.textContent = nh
          nhSpan.classList.add("clickable-nh")
          nhSpan.style.textDecoration = "underline"
          nhSpan.style.cursor = "pointer"

          const killed = Number(crash.numberkilled)
          if (killed > 0) {
            li.style.color = "red"
            li.style.fontWeight = "bold"
          }

          li.append("Crash ID ", idSpan, " — ", nhSpan)
          crashList.appendChild(li)

          uniqueCrashIds.add(crash.incidentid)
        })
      } else {
        // Handle neighborhoods with zero crashes
        const li = document.createElement("li")
        const nhSpan = document.createElement("span")
        nhSpan.textContent = nh
        nhSpan.classList.add("clickable-nh")
        nhSpan.style.textDecoration = "underline"
        nhSpan.style.cursor = "pointer"

        li.innerHTML = `Crash ID <span style="color:#888;">00000000</span> — `
        li.appendChild(nhSpan)
        crashList.appendChild(li)
      }
    })

    // Add crashes not tied to a neighborhood
    if (!filterName || "no neighborhood".includes(filterName.toLowerCase())) {
      noNeighborhoodCrashes.forEach(crash => {
        const li = document.createElement("li")

        const idSpan = document.createElement("span")
        idSpan.textContent = crash.incidentid
        idSpan.classList.add("clickable-id")
        idSpan.style.textDecoration = "underline"
        idSpan.style.cursor = "pointer"

        const nhSpan = document.createElement("span")
        nhSpan.textContent = "no neighborhood"

        const killed = Number(crash.numberkilled)
        if (killed > 0) {
          li.style.color = "red"
          li.style.fontWeight = "bold"
        }

        li.append("Crash ID ", idSpan, " — ", nhSpan)
        crashList.appendChild(li)

        uniqueCrashIds.add(crash.incidentid)
      })
    }


    // Check if any list items were added at all
    const anyItems = crashList.querySelectorAll("li").length > 0
    // Show message if nothing found
    if (!anyItems) {
      noResultsMessage.textContent = "Not Found: please enter a valid neighborhood"
    }

    // Update counter above the list
    counter.textContent = `Total Crashes: ${uniqueCrashIds.size}`

    // Enable click behavior now that list is built
    enableCrashListClicks()

  } catch (err) {
    console.error("Error initializing crash list", err)
  }
}

// Run list builder on page load
initList()

// Export for use elsewhere
export { initList }