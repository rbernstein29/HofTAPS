const results = JSON.parse(localStorage.searchResults);
let currentResults = [...results]; // For sorting without losing original data

document.getElementById("query-title").textContent = "Search Results";
const booksContainer = document.getElementById("books-container");

function renderBooks(bookList) {
    booksContainer.innerHTML = "";

    if (bookList.length > 0) {
        bookList.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const img = document.createElement("img");
            img.className = "book-image";
            img.src = book.thumbnail;

            const details = document.createElement("div");
            details.className = "book-details";

            const title = document.createElement("p");
            title.innerHTML = `<strong>${book.title}</strong>`;

            const author = document.createElement("p");
            author.innerHTML = `${book.author}`;

            const price = document.createElement("p");
            price.innerHTML = `<strong>$${book.price}</strong>`;

            const isbn = document.createElement("p");
            isbn.innerHTML = `<strong>ISBN:</strong> ${book.isbn_number}`;

            bookCard.onclick = () => {
                localStorage.indListing = JSON.stringify(book.id);
                window.location.href = "indListing.html";
            };

            details.appendChild(title);
            details.appendChild(author);
            details.appendChild(price);
            details.appendChild(isbn);

            bookCard.appendChild(img);
            bookCard.appendChild(details);
            booksContainer.appendChild(bookCard);
        });
    } else {
        const noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.textContent = "No results found.";
        booksContainer.appendChild(noResults);
    }
}

// Sorting dropdown handler
const sortDropdown = document.getElementById("sort");
if (sortDropdown) {
    sortDropdown.addEventListener("change", function () {
        const sortOrder = this.value;
        let sorted = [...currentResults];

        if (sortOrder === "lowToHigh") {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "highToLow") {
            sorted.sort((a, b) => b.price - a.price);
        }

        renderBooks(sorted);
    });
}

renderBooks(currentResults);
localStorage.searchResults = "";
