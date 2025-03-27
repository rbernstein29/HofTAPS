import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { firebaseConfig } from "./hoftapsFirebaseConfig.js";

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Checks if the input is an ISBN (either 10 or 13 digits, ignoring hyphens/spaces).
 */
function isISBN(query) {
    const stripped = query.replace(/[-\s]/g, '');
    return /^\d{10}$/.test(stripped) || /^\d{13}$/.test(stripped);
}

/**
 * Fetch book details from ISBN API.
 */
async function fetchBookByISBN(isbn) {
    const apiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const bookKey = `ISBN:${isbn}`;

        if (!data[bookKey]) return null; // No book found
        
        const bookInfo = data[bookKey];
        return {
            title: bookInfo.title || "Unknown Title",
            authors: bookInfo.authors ? bookInfo.authors.map(a => a.name).join(", ") : "Unknown Author",
            publisher: bookInfo.publishers ? bookInfo.publishers.map(p => p.name).join(", ") : "Unknown Publisher",
            isbn: isbn,
            cover: bookInfo.cover ? bookInfo.cover.medium || bookInfo.cover.small : ""
        };
    } catch (error) {
        console.error("Error fetching book from ISBN API:", error);
        return null;
    }
}

/**
 * Fetch books listed in Firebase and match them with the ISBN.
 */
export async function fetchMatchingBooks(isbn) {
    const isbnBook = await fetchBookByISBN(isbn);
    if (!isbnBook) {
        console.log("No book found in ISBN API.");
        return [];
    }

    console.log("ISBN API Data:", isbnBook);

    const listingRef = collection(db, "ListingData");
    const snapshot = await getDocs(query(listingRef, where("isbn", "==", isbnBook.isbn))); // 🔥 MATCH BY ISBN

    let matchingBooks = [];
    snapshot.forEach(doc => {
        matchingBooks.push({ ...doc.data(), id: doc.id, isbnData: isbnBook });
    });

    console.log("Firestore Matching Books:", matchingBooks);

    return matchingBooks;
}

/**
 * Displays search results in a dropdown.
 */
function showDropdown(items) {
    const dropdown = document.getElementById("searchDropdown");
    dropdown.innerHTML = ""; // Clear previous results

    if (items.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    items.forEach(item => {
        const { isbnData, price = "N/A", condition = "Unknown", description = "No description" } = item;

        // Create a result entry
        const div = document.createElement("div");
        div.classList.add("dropdown-item");
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #ddd";
        div.innerHTML = `
            <img src="${isbnData.cover || 'default-cover.jpg'}" alt="Book Cover" style="width: 50px; height: 70px; margin-right: 10px;">
            <div>
                <strong>${isbnData.title}</strong><br>
                <small>By: ${isbnData.authors}</small><br>
                <small>Condition: ${condition}</small><br>
                <small>Price: $${price}</small>
            </div>
        `;

        // Append to dropdown
        dropdown.appendChild(div);
    });

    dropdown.style.display = "block"; // 🔥 Ensure dropdown shows after items are added
}

// Get DOM elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// Listen for input events (as the user types)
searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query.length === 0) {
        document.getElementById("searchDropdown").style.display = "none";
        return;
    }

    if (isISBN(query)) {
        console.log("Searching for ISBN:", query);
        const items = await fetchMatchingBooks(query);
        showDropdown(items);
    } else {
        document.getElementById("searchDropdown").style.display = "none";
    }
});

// Optional: Trigger search on button click
searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (query.length === 0) return;

    if (isISBN(query)) {
        console.log("Searching for ISBN:", query);
        const items = await fetchMatchingBooks(query);
        showDropdown(items);
    }
});


