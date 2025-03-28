// Stores loaded data so it doesn't get loaded more than once
const dataCache = {
  crashIncident: null,             // Holds crash incident data
  crashGeo: null,                  // Holds crash point GeoJSON data
  neighborhoodGeo: null,          // Holds neighborhood boundaries GeoJSON data
  populationSqMilesData: null     // Holds population and square mileage data
};

// Loads crash incident data if not already cached
export async function loadCrashIncidentData() {
  if (!dataCache.crashIncident) {
    const res = await fetch("../data/crashes/01_24_2025_crashes_incident.json"); // Fetch crash incident JSON file
    dataCache.crashIncident = await res.json(); // Parse and store in cache
  }
  return dataCache.crashIncident; // Return cached or fetched data
}

// Loads crash point GeoJSON data if not already cached
export async function loadCrashGeoData() {
  if (!dataCache.crashGeo) {
    const res = await fetch("../data/crashes/01_24_2025_crashes_map.geojson"); // Fetch crash GeoJSON file
    dataCache.crashGeo = await res.json(); // Parse and store in cache
  }
  return dataCache.crashGeo; // Return cached or fetched data
}

// Loads neighborhood boundaries GeoJSON data if not already cached
export async function loadNeighborhoodGeoData() {
  if (!dataCache.neighborhoodGeo) {
    const res = await fetch("../data/neighborhoods/nh_map.geojson"); // Fetch neighborhood GeoJSON file
    dataCache.neighborhoodGeo = await res.json(); // Parse and store in cache
  }
  return dataCache.neighborhoodGeo; // Return cached or fetched data
}

// Loads population and square mileage data if not already cached
export async function loadPopulationSqMilesData() {
  if (!dataCache.populationSqMilesData) {
    const res = await fetch("../data/calculations/nh_population_square_miles.json"); // Fetch population data file
    dataCache.populationSqMilesData = await res.json(); // Parse and store in cache
  }
  return dataCache.populationSqMilesData; // Return cached or fetched data
}

// Clears all cached data so it can be reloaded if needed
export function resetDataCache() {
  dataCache.crashIncident = null;
  dataCache.crashGeo = null;
  dataCache.neighborhoodGeo = null;
  dataCache.populationSqMilesData = null;
}