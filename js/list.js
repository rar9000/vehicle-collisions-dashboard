import {
  loadCrashIncidentData,
  loadPopulationSqMilesData
} from './dataLoader.js';

import { getCrashCountsByNeighborhood } from './calculations.js';
import { zoomToCrash, zoomToNeighborhood } from './click.js';

const crashList = document.getElementById("list");

let cachedCrashes = [];
let cachedNeighborhoods = [];

async function initList(filterName = "") {
  try {
    if (!cachedCrashes.length || !cachedNeighborhoods.length) {
      cachedCrashes = await loadCrashIncidentData();
      cachedNeighborhoods = await loadPopulationSqMilesData();
    }

    crashList.innerHTML = "";

    const crashCounts = getCrashCountsByNeighborhood(cachedCrashes);

    const allNeighborhoods = cachedNeighborhoods.map(n => n.nh_name).sort();
    const crashMap = {};
    allNeighborhoods.forEach(nh => crashMap[nh] = []);

    const noNeighborhoodCrashes = [];

    cachedCrashes.forEach(crash => {
      const nh = crash.nh_name?.trim();
      if (nh && crashMap.hasOwnProperty(nh)) {
        crashMap[nh].push(crash);
      } else {
        noNeighborhoodCrashes.push(crash);
      }
    });

    allNeighborhoods.forEach(nh => {
      if (filterName && !nh.toLowerCase().includes(filterName.toLowerCase())) return;

      const incidents = crashMap[nh];

      if (incidents.length > 0) {
        incidents.forEach(crash => {
          const li = document.createElement("li");

          const idSpan = document.createElement("span");
          idSpan.textContent = crash.incidentid;
          idSpan.classList.add("clickable-id");
          idSpan.style.textDecoration = "underline";
          idSpan.style.cursor = "pointer";
          idSpan.addEventListener("click", () => zoomToCrash(crash.incidentid));

          const nhSpan = document.createElement("span");
          nhSpan.textContent = nh;
          nhSpan.classList.add("clickable-nh");
          nhSpan.style.textDecoration = "underline";
          nhSpan.style.cursor = "pointer";
          nhSpan.addEventListener("click", () => zoomToNeighborhood(nh));

          const killed = Number(crash.numberkilled);
          if (killed > 0) {
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
        nhSpan.addEventListener("click", () => zoomToNeighborhood(nh));

        li.innerHTML = `Crash ID <span style="color:#888;">00000000</span> — `;
        li.appendChild(nhSpan);
        crashList.appendChild(li);
      }
    });

    // Ungrouped crashes (no neighborhood)
    noNeighborhoodCrashes.forEach(crash => {
      if (filterName && !"no neighborhood".includes(filterName.toLowerCase())) return;

      const li = document.createElement("li");

      const idSpan = document.createElement("span");
      idSpan.textContent = crash.incidentid;
      idSpan.classList.add("clickable-id");
      idSpan.style.textDecoration = "underline";
      idSpan.style.cursor = "pointer";
      idSpan.addEventListener("click", () => zoomToCrash(crash.incidentid));

      const nhSpan = document.createElement("span");
      nhSpan.textContent = "no neighborhood";

      const killed = Number(crash.numberkilled);
      if (killed > 0) {
        li.style.color = "red";
        li.style.fontWeight = "bold";
      }

      li.append("Crash ID ", idSpan, " — ", nhSpan);
      crashList.appendChild(li);
    });

  } catch (err) {
    console.error("Error initializing crash list:", err);
  }
}

initList();

export { initList };