import { resetMapView } from './map.js';
import { initList } from './list.js';
import { clearNeighborhoodHighlight } from './click.js';


const resetBtn = document.getElementById("resetButton");

resetBtn.addEventListener("click", () => {
  clearNeighborhoodHighlight();
  resetMapView();
  initList(); 
  document.getElementById("searchBar").value = ""; 
});