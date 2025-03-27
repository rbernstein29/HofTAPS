export async function displayResults() {
    const results = JSON.parse(localStorage.searchResults)

    if (!results) return;

    document.getElementById("query-title").textContent = "Search Results";
    const booksContainer = document.getElementById("books-container");
    booksContainer.innerHTML = "";

    if (results) {
        results.forEach(book => {
            const bookISBN = book.isbn_number;  
            //const info = "";
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const img = document.createElement("img");
            img.src = book.thumbnail || "https://via.placeholder.com/120x180";

            const title = document.createElement("div");
            title.className = "book-title";
            title.textContent = book.title;

            const author = document.createElement("div");
            author.className = "book-author";
            author.textContent = book.author;

            const offerButton = document.createElement("button");
            offerButton.className = "place-offer-button";
            offerButton.textContent = "Place Offer";
            
            offerButton.onclick = () => {
                window.location.href = `bookDetails.html?id=${bookISBN}`;
            };

            bookCard.appendChild(img);
            bookCard.appendChild(title);
            bookCard.appendChild(author);
            bookCard.appendChild(offerButton);
            booksContainer.appendChild(bookCard);
        });
    }
}
window.onload = displayResults;