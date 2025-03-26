import { renderCrashList } from './list.js';

const searchInput = document.getElementById("searchBar");

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  renderCrashList(query);
}

searchInput.addEventListener("input", handleSearch);

