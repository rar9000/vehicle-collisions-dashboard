import { zoomToNeighborhood } from './click.js';
import {
  loadCrashIncidentData,
  loadPopulationSqMilesData
} from './dataLoader.js';

import {
  getCrashCountsByNeighborhood,
  getTopNeighborhoodsByCrashRateSqMi
} from './calculations.js';

async function initChart() {
  try {
    const [crashes, neighborhoodData] = await Promise.all([
      loadCrashIncidentData(),
      loadPopulationSqMilesData()
    ]);

    const crashCounts = getCrashCountsByNeighborhood(crashes);
    const top5 = getTopNeighborhoodsByCrashRateSqMi(crashCounts, neighborhoodData, 5);

    const labels = top5.map(x => x.nh_name);
    const values = top5.map(x => x.rate);

    const ctx = document.getElementById("chart").getContext("2d");

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
        onClick: function (event, elements) {
          if (!elements.length) return;
          const clickedIndex = elements[0].index;
          const nhName = labels[clickedIndex];
          zoomToNeighborhood(nhName);
        }
      }
    });

  } catch (err) {
    console.error("🔥 Chart rendering error:", err);
  }
}

initChart();