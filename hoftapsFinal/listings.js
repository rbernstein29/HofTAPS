import { fetchMatchingBooks } from "./searchHelper.js";

// Initialize Firebase and Firestore
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const subject = document.getElementById("subjectFilter");
const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");

searchButton.onclick = async (e) => {
    fetchMatchingBooks(searchBar.value, Number(minPrice.value), Number(maxPrice.value), subject.value).then(results => {
        localStorage.searchResults = JSON.stringify(results);
    
        window.location.href = "HTAPListings.html";
    });
}