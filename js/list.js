import { zoomToCrash, zoomToNeighborhood } from './click.js';

const crashList = document.getElementById("list");

Promise.all([
  fetch("../data/crashes/01_24_2025_crashes_incident.json").then(res => res.json()),
  fetch("../data/calculations/nh_population_square_miles.json").then(res => res.json())
])
.then(([crashes, neighborhoods]) => {
  const allNeighborhoods = neighborhoods.map(n => n.nh_name).sort();
  const crashMap = {};
  allNeighborhoods.forEach(nh => crashMap[nh] = []);

  const noNeighborhoodCrashes = [];

  crashes.forEach(crash => {
    const nh = crash.nh_name?.trim();
    if (nh && crashMap.hasOwnProperty(nh)) {
      crashMap[nh].push(crash);
    } else {
      noNeighborhoodCrashes.push(crash);
    }
  });

  // Render grouped crashes
  allNeighborhoods.forEach(nh => {
    const incidents = crashMap[nh];

    if (incidents.length > 0) {
      incidents.forEach(crash => {
        const li = document.createElement("li");

        const idSpan = document.createElement("span");
        idSpan.textContent = crash.incidentid;
        idSpan.classList.add("clickable-id");
        idSpan.style.textDecoration = "underline";
        idSpan.style.cursor = "pointer";
        idSpan.addEventListener("click", () => {
          zoomToCrash(crash.incidentid);
        });

        const nhSpan = document.createElement("span");
        nhSpan.textContent = nh;
        nhSpan.classList.add("clickable-nh");
        nhSpan.style.textDecoration = "underline";
        nhSpan.style.cursor = "pointer";
        nhSpan.addEventListener("click", () => {
          zoomToNeighborhood(nh);
        });

        if (crash.NumberKilled && crash.NumberKilled > 0) {
          li.style.color = "red";
          li.style.fontWeight = "bold";
        }

        li.append("Crash ID ", idSpan, " — ", nhSpan);
        crashList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      const nhSpan = document.createElement("span");
      nhSpan.textContent = nh;
      nhSpan.classList.add("clickable-nh");
      nhSpan.style.textDecoration = "underline";
      nhSpan.style.cursor = "pointer";
      nhSpan.addEventListener("click", () => {
        zoomToNeighborhood(nh);
      });

      li.innerHTML = `Crash ID <span style="color:#888;">00000000</span> — `;
      li.appendChild(nhSpan);
      crashList.appendChild(li);
    }
  });

  // Add unmatched crashes
  noNeighborhoodCrashes.forEach(crash => {
    const li = document.createElement("li");

    const idSpan = document.createElement("span");
    idSpan.textContent = crash.incidentid;
    idSpan.classList.add("clickable-id");
    idSpan.style.textDecoration = "underline";
    idSpan.style.cursor = "pointer";
    idSpan.addEventListener("click", () => {
      zoomToCrash(crash.incidentid);
    });

    const nhSpan = document.createElement("span");
    nhSpan.textContent = "no neighborhood";

    if (crash.NumberKilled && crash.NumberKilled > 0) {
      li.style.color = "red";
      li.style.fontWeight = "bold";
    }

    li.append("Crash ID ", idSpan, " — ", nhSpan);
    crashList.appendChild(li);
  });
})
.catch(err => console.error("Error loading crash or neighborhood data:", err));