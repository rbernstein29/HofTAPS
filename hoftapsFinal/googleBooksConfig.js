// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Your Firebase configuration object
export const firebaseConfig = {
  apiKey: "AIzaSyCVmx7rzCJf84-dhvbtVbCud9XN5BaGars",
  authDomain: "hoftaps-db6f8.firebaseapp.com",
  projectId: "hoftaps-db6f8",
  storageBucket: "hoftaps-db6f8.firebasestorage.app",
  messagingSenderId: "1009832415546",
  appId: "1:1009832415546:web:55f3c5351cda418f6f4003",
  measurementId: "G-W6Q2E49PEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Utility function to check if the query is a valid ISBN (10 or 13 digits)
 */
function isISBN(query) {
  // Remove hyphens and spaces from the input
  const stripped = query.replace(/[-\s]/g, '');
  return /^\d{10}$/.test(stripped) || /^\d{13}$/.test(stripped);
}

/**
 * Function: searchTextbooks
 * Description:
 *   Accepts a search query from a search bar.
 *   If the query is an ISBN, it constructs a search URL using "isbn:".
 *   Otherwise, it appends "textbook" to limit results.
 *   Fetched book data is then stored in the "books" collection of Firestore.
 *
 * @param {string} query - The search query from the user.
 */
async function searchTextbooks(query) {
  let apiQuery;
  
  if (isISBN(query)) {
    // If the query is an ISBN, search using the ISBN filter
    apiQuery = "isbn:" + query;
  } else {
    // Otherwise, ensure we search only for textbooks
    apiQuery = query + " textbook";
  }
  
  const url = "https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(apiQuery);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log("No books found for query:", query);
      return;
    }
    
    for (const item of data.items) {
      const volumeInfo = item.volumeInfo;
      const bookData = {
        // Use available fields, providing defaults if necessary.
        authors: volumeInfo.authors || [],
        publisher: volumeInfo.publisher || "Unknown Publisher",
        edition: volumeInfo.edition || "Unknown Edition", // Note: edition info may not always be available
        isbn: (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers[0] 
                ? volumeInfo.industryIdentifiers[0].identifier 
                : "Unknown ISBN"),
        description: volumeInfo.description || "",
        title: volumeInfo.title || "No Title",
        thumbnail: (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) 
                    ? volumeInfo.imageLinks.thumbnail 
                    : "",
      };
      
      try {
        await addDoc(collection(db, "books"), bookData);
        console.log(`Book added: ${bookData.title}`);
      } catch (error) {
        console.error("Error adding book:", error);
      }
    }
  } catch (error) {
    console.error("Error fetching Google Books data:", error);
  }
}

// Example usage:
// Assume you have a search bar in your HTML with an input element (id="searchInput")
// and a button that calls the searchTextbooks function on click.
document.getElementById("searchButton").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    searchTextbooks(query);
  } else {
    alert("Please enter a search term.");
  }
});

// Export the function for use elsewhere if needed
export { searchTextbooks };

