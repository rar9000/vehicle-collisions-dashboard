// Imports function to reset the map view
import { resetMapView } from './map.js'

// Imports function to rebuild the list
import { initList } from './list.js'

// Imports function to clear neighborhood highlight
import { clearNeighborhoodHighlight } from './click.js'

// Gets the reset button from the page
const resetBtn = document.getElementById("resetButton")

// Runs actions when the reset button is clicked
resetBtn.addEventListener("click", () => {
  clearNeighborhoodHighlight() // Removes neighborhood highlight
  resetMapView() // Resets map to original view
  initList() // Rebuilds the full list
  document.getElementById("searchBar").value = "" // Clears the search input
})