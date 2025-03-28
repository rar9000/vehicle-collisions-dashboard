// Returns an array from input whether it's already an array or geojson
function normalizeFeatures(input) {
  return Array.isArray(input) ? input : input.features || []
}

// Counts number of crashes in each neighborhood
export function getCrashCountsByNeighborhood(crashes) {
  const crashCounts = {}
  crashes.forEach(crash => {
    const nh = crash.nh_name
    if (nh) {
      crashCounts[nh] = (crashCounts[nh] || 0) + 1 // Add 1 to the count
    }
  })
  return crashCounts
}

// Calculates crash rate per 1000 people in each neighborhood
export function calculateCrashRatePerPopulation(crashCounts, populations) {
  const list = normalizeFeatures(populations) // Make sure input is an array
  const rates = {}
  list.forEach(item => {
    const props = item.properties || item
    const nh_name = props.nh_name
    const population = props.population
    const crashes = crashCounts[nh_name] || 0
    if (population && population > 0) {
      rates[nh_name] = ((crashes / population) * 1000).toFixed(2) // Rate per 1000 people
    } else {
      rates[nh_name] = "N/A" // If no population mark as not available
    }
  })
  return rates
}

// Calculates crash rate per square mile in each neighborhood
export function calculateCrashRatePerSquareMile(crashCounts, areas) {
  const list = normalizeFeatures(areas)
  const rates = {}
  list.forEach(item => {
    const props = item.properties || item
    const nh_name = props.nh_name
    const square_miles = props.square_miles
    const crashes = crashCounts[nh_name] || 0
    if (square_miles && square_miles > 0) {
      rates[nh_name] = (crashes / square_miles).toFixed(2) // Rate per square mile
    } else {
      rates[nh_name] = "N/A" // If no area mark as not available
    }
  })
  return rates
}

// Gets top neighborhoods with the highest crash rate per square mile
export function getTopNeighborhoodsByCrashRateSqMi(crashCounts, areas, topN = 5) {
  const list = normalizeFeatures(areas)
  const rates = list.map(item => {
    const props = item.properties || item
    const nh_name = props.nh_name
    const square_miles = props.square_miles
    const count = crashCounts[nh_name] || 0
    return {
      nh_name,
      rate: square_miles && square_miles > 0 ? count / square_miles : 0
    }
  })

  return rates
    .sort((a, b) => b.rate - a.rate) // Sort from highest to lowest
    .slice(0, topN) // Keep only the top N
    .map(item => ({
      nh_name: item.nh_name,
      rate: item.rate.toFixed(2)
    }))
}

// Creates a lookup table using crash ID as the key
export function createIncidentLookup(crashIncidentData) {
  const lookup = {}
  crashIncidentData.forEach(crash => {
    lookup[crash.incidentid] = crash // Store full crash record by ID
  })
  return lookup
}