
import { zoomToNeighborhood } from './click.js';
import {
  loadCrashIncidentData,
  loadPopulationSqMilesData
} from './dataLoader.js';

async function renderChart() {
  try {
    const [crashes, neighborhoods] = await Promise.all([
      loadCrashIncidentData(),
      loadPopulationSqMilesData()
    ]);

    // Count crashes per neighborhood
    const crashCounts = {};
    crashes.forEach(crash => {
      const nh = crash.nh_name?.trim();
      if (nh) crashCounts[nh] = (crashCounts[nh] || 0) + 1;
    });

    // Map of square miles
    const squareMilesMap = {};
    neighborhoods.forEach(entry => {
      squareMilesMap[entry.nh_name] = entry.square_miles;
    });

    // Calculate crash rate per square mile
    const crashRates = Object.entries(crashCounts)
      .map(([nh, count]) => {
        const mi = squareMilesMap[nh];
        return mi && mi > 0
          ? { nh_name: nh, rate: count / mi }
          : null;
      })
      .filter(Boolean);

    const top = crashRates.sort((a, b) => b.rate - a.rate).slice(0, 5);
    const labels = top.map(x => x.nh_name);
    const values = top.map(x => x.rate.toFixed(2));

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
    console.error("Chart rendering error:", err);
  }
}

document.addEventListener("DOMContentLoaded", renderChart);