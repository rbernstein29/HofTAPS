document.addEventListener("DOMContentLoaded", () => {
    const wishlistContainer = document.getElementById("wishlist-container");
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = "<p>No items in your wishlist.</p>";
        return;
    }

    wishlist.forEach(item => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";

        const img = document.createElement("img");
        img.src = item.thumbnail;

        const details = document.createElement("div");
        details.className = "book-details";

        // Create detail elements for each piece of information
        const title = document.createElement("p");
        title.innerHTML = `<strong>Title:</strong> ${item.title}`;

        const author = document.createElement("p");
        author.innerHTML = `<strong>Author:</strong> ${item.author}`;

        const isbn = document.createElement("p");
        isbn.innerHTML = `<strong>ISBN:</strong> ${item.isbn}`;

        // Append details to the details container
        details.appendChild(title);
        details.appendChild(author);
        details.appendChild(isbn);

        // Optionally add a remove button
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "Remove from Wishlist";
        removeBtn.onclick = () => {
            // Remove item from wishlist and update localStorage
            let updatedWishlist = JSON.parse(localStorage.getItem("wishlist")).filter(i => i.id !== item.id);
            localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
            // Remove the card from the DOM
            bookCard.remove();
        };

        bookCard.appendChild(img);
        bookCard.appendChild(details);
        bookCard.appendChild(removeBtn);

        wishlistContainer.appendChild(bookCard);
    });
});
