async function searchBooks() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (!query) return;

    document.getElementById("query-title").textContent = `Search results for "${query}"`;

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    const data = await response.json();
    const booksContainer = document.getElementById("books-container");
    booksContainer.innerHTML = "";

    if (data.items) {
        data.items.forEach(book => {
            const bookId = book.id;  
            const info = book.volumeInfo;
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const img = document.createElement("img");
            img.src = info.imageLinks?.thumbnail || "https://via.placeholder.com/120x180";

            const title = document.createElement("div");
            title.className = "book-title";
            title.textContent = info.title;

            const author = document.createElement("div");
            author.className = "book-author";
            author.textContent = info.authors ? "by " + info.authors.join(", ") : "Unknown Author";

            const offerButton = document.createElement("button");
            offerButton.className = "place-offer-button";
            offerButton.textContent = "Place Offer";
            
            offerButton.onclick = () => {
                window.location.href = `bookDetails.html?id=${bookId}`;
            };

            bookCard.appendChild(img);
            bookCard.appendChild(title);
            bookCard.appendChild(author);
            bookCard.appendChild(offerButton);
            booksContainer.appendChild(bookCard);
        });
    }
}
window.onload = searchBooks;