
export function createNeighborhoodPopup(props, crashCounts, crashRatePop, crashRateArea) {
    const name = props.nh_name;
    const population = props.population;
    const squareMiles = props.square_miles;
    const crashes = crashCounts[name] || 0;
  
    return `
      <b>${name}</b><br>
      Population: ${population.toLocaleString()}<br>
      Area: ${squareMiles.toFixed(2)} mi²<br>
      Crashes: ${crashes}<br>
      Crash Rate (per 1,000 people): ${crashRatePop[name] || "N/A"}<br>
      Crash Rate (per sq mi): ${crashRateArea[name] || "N/A"}
    `;
  }
  