import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { firebaseConfig } from "./hoftapsFirebaseConfig.js";

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");

searchButton.onclick = async (e) =>{
    e.preventDefault();

    fetchMatchingBooks(searchBar.value, 0, 100000, "").then(results => {
        localStorage.searchResults = JSON.stringify(results);
    
        window.location.href = "HTAPListings.html";
    });

}

/**
 * Fetch books listed in Firebase and match them with the ISBN, title, or author.
 */
export async function fetchMatchingBooks(userQuery, minPriceQuery, maxPriceQuery, subjectQuery) {
    // Checks if filters have been applied
    if (subjectQuery == "None" || subjectQuery == "Choose Subject" || subjectQuery == "undefined") { subjectQuery = ""; }
    if (minPriceQuery == "" || minPriceQuery == "undefined") { minPriceQuery = 0; }
    if (maxPriceQuery == "" || maxPriceQuery == "undefined") { maxPriceQuery = 100000; }

    const listingRef = collection(db, "Textbook Data");
    var isbnSnapshot = "";
    var titleSnapshot = "";
    var authorSnapshot = "";

    // No subject filter applied
    if (subjectQuery == "") {
        isbnSnapshot = await getDocs(query(listingRef, where("isbn_number", "==", userQuery), where("price", ">=", minPriceQuery), where("price", "<=", maxPriceQuery))); // match by ISBN
        titleSnapshot = await getDocs(query(listingRef, where("title", "==", userQuery), where("price", ">=", minPriceQuery), where("price", "<=", maxPriceQuery))); // match by title
        authorSnapshot = await getDocs(query(listingRef, where("author", "==", userQuery), where("price", ">=", minPriceQuery), where("price", "<=", maxPriceQuery))); // match by author
    } else {
        isbnSnapshot = await getDocs(query(listingRef, where("isbn_number", "==", userQuery), where("subject", "==", subjectQuery), where("price", ">=", minPriceQuery), where(
            "price", "<=", maxPriceQuery))); // match by ISBN
        titleSnapshot = await getDocs(query(listingRef, where("title", "==", userQuery), where("subject", "==", subjectQuery), where("price", ">=", minPriceQuery), where(
            "price", "<=", maxPriceQuery))); // match by title
        authorSnapshot = await getDocs(query(listingRef, where("author", "==", userQuery), where("subject", "==", subjectQuery), where("price", ">=", minPriceQuery), where(
            "price", "<=", maxPriceQuery))); // match by author
    }

    let matchingBooks = [];
    isbnSnapshot.forEach(doc => {
        matchingBooks.push({ ...doc.data(), id: doc.id, isbnData: userQuery })
    });
    titleSnapshot.forEach(doc => {
        matchingBooks.push({ ...doc.data(), id: doc.id, titleData: userQuery })
    });
    authorSnapshot.forEach(doc => {
        matchingBooks.push({ ...doc.data(), id: doc.id, authorData: userQuery })
    });

    return matchingBooks;
}