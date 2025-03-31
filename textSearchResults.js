import { purchaseBook } from "./purchaseTextbook.js";

export async function displayResults() {
    const results = JSON.parse(localStorage.searchResults)

    document.getElementById("query-title").textContent = "Search Results";
    const booksContainer = document.getElementById("books-container");
    booksContainer.innerHTML = "";

    if (results.length > 0) {
        results.forEach(book => {
            const bookISBN = book.isbn_number;  
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const img = document.createElement("img");
            img.src = book.thumbnail;

            const title = document.createElement("div");
            title.className = "book-title";
            title.textContent = book.title;

            const author = document.createElement("div");
            author.className = "book-author";
            author.textContent = book.author;

            const isbn = document.createElement("div");
            isbn.className = "book-isbn";
            isbn.textContent = bookISBN;

            const purchaseButton = document.createElement("button");
            purchaseButton.className = "purchase-button";
            purchaseButton.textContent = "Purchase";
            
            purchaseButton.onclick = () => {
                purchaseBook(book.id);
                //window.location.href = "HTAPListings.html";
            };

            const wishlistButton = document.createElement("button");
            wishlistButton.className = "wishlist-button";
            wishlistButton.textContent = "★";

            // TEST CASE
            wishlistButton.onclick = () => {
                // Create an object with all listing details you want to save
                const wishlistItem = {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn_number,
                    thumbnail: book.thumbnail,
                    // add any other details you need
                };

                // Get current wishlist from localStorage (or initialize an empty array)
                let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
                // Optional: Check if the item already exists to prevent duplicates
                if (!wishlist.some(item => item.id === wishlistItem.id)) {
                    wishlist.push(wishlistItem);
                    localStorage.setItem("wishlist", JSON.stringify(wishlist));
                    alert("Added to wishlist!");
                } else {
                    alert("This book is already in your wishlist.");
                }
            };
                


            bookCard.appendChild(img);
            bookCard.appendChild(title);
            bookCard.appendChild(author);
            bookCard.appendChild(isbn);
            bookCard.appendChild(purchaseButton);
            bookCard.appendChild(wishlistButton);
            booksContainer.appendChild(bookCard);
        });
    } else {
        const noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.textContent = "No results found.";
        booksContainer.appendChild(noResults);
    }
}
window.onload = displayResults;