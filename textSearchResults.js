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

            bookCard.appendChild(img);
            bookCard.appendChild(title);
            bookCard.appendChild(author);
            bookCard.appendChild(isbn);
            bookCard.appendChild(purchaseButton);
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