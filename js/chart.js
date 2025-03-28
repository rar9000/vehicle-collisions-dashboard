// Imports function to zoom to a neighborhood from the map
import { zoomToNeighborhood } from './click.js'

// Imports functions to load crash and population data
import {
  loadCrashIncidentData,
  loadPopulationSqMilesData
} from './dataLoader.js'

// Imports functions to count crashes and get top neighborhoods by rate
import {
  getCrashCountsByNeighborhood,
  getTopNeighborhoodsByCrashRateSqMi
} from './calculations.js'

// Builds and displays the crash rate chart
async function initChart() {
  try {
    // Loads crash data and neighborhood area data
    const [crashes, neighborhoodData] = await Promise.all([
      loadCrashIncidentData(),
      loadPopulationSqMilesData()
    ])

    // Gets crash totals for each neighborhood
    const crashCounts = getCrashCountsByNeighborhood(crashes)

    // Gets top 5 neighborhoods by crash rate per square mile
    const top5 = getTopNeighborhoodsByCrashRateSqMi(crashCounts, neighborhoodData, 5)

    // Extracts neighborhood names for labels
    const labels = top5.map(x => x.nh_name)

    // Extracts crash rates for values
    const values = top5.map(x => x.rate)

    // Gets the canvas context for drawing the chart
    const ctx = document.getElementById("chart").getContext("2d")

    // Creates a bar chart using Chart.js
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Crashes per Sq Mile",
          data: values,
          backgroundColor: "tomato"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Top 5 Neighborhoods by Crash Rate (Per Sq Mile)"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Crash Rate"
            }
          }
        },
        // Makes chart bars clickable to zoom to neighborhood
        onClick: function (event, elements) {
          if (!elements.length) return
          const clickedIndex = elements[0].index
          const nhName = labels[clickedIndex]
          zoomToNeighborhood(nhName)
        }
      }
    })

  } catch (err) {
    console.error(" Chart rendering error", err)
  }
}

// Calls the chart function when the page loads
initChart()