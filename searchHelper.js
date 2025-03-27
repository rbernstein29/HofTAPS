import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { firebaseConfig } from "./hoftapsFirebaseConfig.js";
import { displayResults } from "./searchResults.js";

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchBar = document.getElementById("search-bar");
const searchButton = document.getElementById("search-button");

searchButton.onclick = async (e) =>{
    e.preventDefault();

    fetchMatchingBooks(searchBar.value).then(results => {

        console.log(results);

        localStorage.searchResults = JSON.stringify(results);
    
        window.location.href = "searchResults.html";
    });

}

/**
 * Fetch books listed in Firebase and match them with the ISBN.
 */
export async function fetchMatchingBooks(isbn) {
    const listingRef = collection(db, "Textbook Data");
    const snapshot = await getDocs(query(listingRef, where("isbn_number", "==", isbn))); // 🔥 MATCH BY ISBN

    console.log(snapshot);

    let matchingBooks = [];
    snapshot.forEach(doc => {
        matchingBooks.push({ ...doc.data(), id: doc.id, isbnData: isbn });
    });

    console.log("Firestore Matching Books:", matchingBooks);

    return matchingBooks;
}