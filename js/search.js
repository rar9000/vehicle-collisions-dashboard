import { initList } from './list.js';

const searchInput = document.getElementById("searchBar");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  initList(query);
});