export async function searchBooks(query) {
    if (query.length < 1) return;
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    const data = await response.json();
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
    
    if (data.items) {
        data.items.forEach(book => {
            const item = document.createElement("div");
            item.className = "suggestion-item";
            
            const img = document.createElement("img");
            img.src = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/40x60";
            
            const text = document.createElement("span");
            text.textContent = book.volumeInfo.title;
            
            item.appendChild(img);
            item.appendChild(text);
            item.onclick = () => redirectToBookDetails(book.id); 
            
            suggestions.appendChild(item);
        });
    }
}

function redirectToBookDetails(bookId) {
    window.location.href = `bookDetails.html?id=${bookId}`;
}

function handleSearch() {
    const query = document.getElementById("search-bar").value.trim();
    window.location.href = `searchResult.html?q=${encodeURIComponent(query)}`;
}
