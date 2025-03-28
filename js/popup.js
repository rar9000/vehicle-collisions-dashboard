// Builds the popup content for a neighborhood
export function createNeighborhoodPopup(props, crashCounts, crashRatePop, crashRateArea) {
  const name = props.nh_name // Neighborhood name
  const population = props.population // Total population
  const squareMiles = props.square_miles // Total area in square miles
  const crashes = crashCounts[name] || 0 // Crash count for this neighborhood

  // Returns a string of html to display in the popup
  return `
    <b>${name}</b><br>
    Population: ${population.toLocaleString()}<br>
    Area: ${squareMiles.toFixed(2)} mi²<br>
    Crashes: ${crashes}<br>
    Crash Rate (per 1000 people): ${crashRatePop[name] || "N/A"}<br>
    Crash Rate (per sq mi): ${crashRateArea[name] || "N/A"}
  `
}