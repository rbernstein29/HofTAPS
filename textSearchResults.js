const results = JSON.parse(localStorage.searchResults)

document.getElementById("query-title").textContent = "Search Results";
const booksContainer = document.getElementById("books-container");
booksContainer.innerHTML = "";

    if (results.length > 0) {
        results.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const img = document.createElement("img");
            img.className = "book-image";
            img.src = book.thumbnail;

            const details = document.createElement("div");
            details.className = "book-details";

            // Create detail elements for each piece of information
            const title = document.createElement("p");
            title.innerHTML = `<strong>Title:</strong> ${book.title}`;

            const author = document.createElement("p");
            author.innerHTML = `<strong>Author:</strong> ${book.author}`;

            const isbn = document.createElement("p");
            isbn.innerHTML = `<strong>ISBN:</strong> ${book.isbn_number}`;

            const price = document.createElement("p");
            price.innerHTML = `<strong>$</strong> ${book.price}`;

            bookCard.onclick = () => {
                localStorage.indListing = JSON.stringify(book);

                window.location.href = "indListing.html";
            }
                
            details.appendChild(title);
            details.appendChild(author);
            details.appendChild(isbn);
            details.appendChild(price);
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
    localStorage.searchResults = "";