
document.addEventListener("DOMContentLoaded", function () {
    fetch("../data/crashes/01_24_2025_crashes_incident.json")
        .then(response => response.json())
        .then(data => {
            let counts = {};

            data.forEach(crash => {
                let nh = crash.nh_name;
                if (nh && nh.trim() !== "") {
                    counts[nh] = (counts[nh] || 0) + 1;
                }
            });

            let sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
            let labels = sorted.map(x => x[0]);
            let values = sorted.map(x => x[1]);

            new Chart(document.getElementById("chart"), {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Crashes",
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
                            text: "Top 5 Neighborhoods by Crashes"
                        }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        });
});