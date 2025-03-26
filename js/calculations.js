// Utility to normalize input (accepts GeoJSON or plain array)
function normalizeFeatures(input) {
    return Array.isArray(input) ? input : input.features || [];
  }
  
  // Count crashes per neighborhood
  export function getCrashCountsByNeighborhood(crashes) {
    const crashCounts = {};
    crashes.forEach(crash => {
      const nh = crash.nh_name;
      if (nh) {
        crashCounts[nh] = (crashCounts[nh] || 0) + 1;
      }
    });
    return crashCounts;
  }
  
  // Calculate crash rates per 1,000 people
  export function calculateCrashRatePerPopulation(crashCounts, populations) {
    const list = normalizeFeatures(populations);
    const rates = {};
    list.forEach(item => {
      const props = item.properties || item;
      const { nh_name, population } = props;
      const crashes = crashCounts[nh_name] || 0;
      if (population && population > 0) {
        rates[nh_name] = ((crashes / population) * 1000).toFixed(2);
      } else {
        rates[nh_name] = "N/A";
      }
    });
    return rates;
  }
  
  // Calculate crash rates per square mile
  export function calculateCrashRatePerSquareMile(crashCounts, areas) {
    const list = normalizeFeatures(areas);
    const rates = {};
    list.forEach(item => {
      const props = item.properties || item;
      const { nh_name, square_miles } = props;
      const crashes = crashCounts[nh_name] || 0;
      if (square_miles && square_miles > 0) {
        rates[nh_name] = (crashes / square_miles).toFixed(2);
      } else {
        rates[nh_name] = "N/A";
      }
    });
    return rates;
  }
  
  // Get top N neighborhoods by crash rate per square mile
  export function getTopNeighborhoodsByCrashRateSqMi(crashCounts, areas, topN = 5) {
    const list = normalizeFeatures(areas);
    const rates = list.map(item => {
      const props = item.properties || item;
      const { nh_name, square_miles } = props;
      const count = crashCounts[nh_name] || 0;
      return {
        nh_name,
        rate: square_miles && square_miles > 0 ? count / square_miles : 0
      };
    });
  
    return rates
      .sort((a, b) => b.rate - a.rate)
      .slice(0, topN)
      .map(item => ({
        nh_name: item.nh_name,
        rate: item.rate.toFixed(2)
      }));
  }
  
  // Build lookup for incident weather queries
  export function createIncidentLookup(crashIncidentData) {
    const lookup = {};
    crashIncidentData.forEach(crash => {
      lookup[crash.incidentid] = {
        lat: crash.latitude,
        lon: crash.longitude,
        timestamp: crash.timestamp
      };
    });
    return lookup;
  }
  