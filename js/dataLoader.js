
// Cache object to hold loaded data
const dataCache = {
    crashIncident: null,
    crashGeo: null,
    neighborhoodGeo: null,
    populationSqMilesData: null,
  };
  
  // Function to load crash incident json
  export async function loadCrashIncidentData() {
    if (!dataCache.crashIncident) {
      const res = await fetch("../data/crashes/01_24_2025_crashes_incident.json");
      dataCache.crashIncident = await res.json();
    }
    return dataCache.crashIncident;
  }
  
  // Function to load crash point geojson
  export async function loadCrashGeoData() {
    if (!dataCache.crashGeo) {
      const res = await fetch("../data/crashes/01_24_2025_crashes_map.geojson");
      dataCache.crashGeo = await res.json();
    }
    return dataCache.crashGeo;
  }
  
  // Function to load neighborhood boundaries geojson
  export async function loadNeighborhoodGeoData() {
    if (!dataCache.neighborhoodGeo) {
      const res = await fetch("../data/neighborhoods/nh_map.geojson");
      dataCache.neighborhoodGeo = await res.json();
    }
    return dataCache.neighborhoodGeo;
  }
  
  // Function to load population/square mileage per neighborhood json
  export async function loadPopulationSqMilesData() {
    if (!dataCache.populationSqMilesData) {
      const res = await fetch("../data/calculations/nh_population_square_miles.json");
      dataCache.populationSqMilesData = await res.json();
    }
    return dataCache.populationSqMilesData;
  }
  
  // Function to reset cache 
  export function resetDataCache() {
    dataCache.crashIncident = null;
    dataCache.crashGeo = null;
    dataCache.neighborhoodGeo = null;
    dataCache.populationSqMilesData = null;
  }