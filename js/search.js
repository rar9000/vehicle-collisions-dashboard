// Imports the list function that displays crash data
import { initList } from './list.js'

// Gets the search input field from the page
const searchInput = document.getElementById("searchBar")

// Listens for changes in the input field
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase() // Gets the search text
  initList(query) // Filters the list based on the search text
})