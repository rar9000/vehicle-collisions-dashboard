import { zoomToNeighborhood } from './click.js';

document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
        fetch("../data/crashes/01_24_2025_crashes_incident.json").then(r => r.json()),
        fetch("../data/calculations/nh_population_square_miles.json").then(r => r.json())
    ])
    .then(([crashes, neighborhoods]) => {
        const crashCounts = {};
        crashes.forEach(crash => {
            const nh = crash.nh_name;
            if (nh && nh.trim() !== "") {
                crashCounts[nh] = (crashCounts[nh] || 0) + 1;
            }
        });

        const squareMilesMap = {};
        neighborhoods.forEach(entry => {
            squareMilesMap[entry.nh_name] = entry.square_miles;
        });

        const crashRates = [];
        for (let nh in crashCounts) {
            const mi = squareMilesMap[nh];
            if (mi && mi > 0) {
                crashRates.push({ nh_name: nh, rate: crashCounts[nh] / mi });
            }
        }

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
    })
    .catch(err => console.error("Chart error:", err));
});