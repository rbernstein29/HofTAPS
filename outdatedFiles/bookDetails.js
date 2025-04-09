function stripHTML(html) {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

async function fetchBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");

    if (!bookId) {
        document.getElementById("book-container").innerHTML = "<p>Book Not Found.</p>";
        return;
    }

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
    const data = await response.json();

    if (!data.volumeInfo) {
        document.getElementById("book-container").innerHTML = "<p>Book details not available.</p>";
        return;
    }

    document.getElementById("book-image").src = data.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/250x350";
    document.getElementById("book-title").textContent = data.volumeInfo.title || "Unknown Title";
    document.getElementById("book-author").textContent = `Author: ${data.volumeInfo.authors?.join(", ") || "Unknown"}`;

    const rawDescription = data.volumeInfo.description || "No description available.";
    document.getElementById("book-description").textContent = stripHTML(rawDescription);
}   

function placeOffer() {
    const offerAmount = document.getElementById("offer-input").value;
    if (!offerAmount || isNaN(offerAmount) || offerAmount <= 0) {
        alert("Please enter a valid offer.");
        return;
    }
    if (offerAmount >= 9999) {
        alert("Please enter an offer less than $10000")
        return;
    }
    else{
        alert(`Your offer of $${offerAmount} has been placed!`);
    }
}

window.onload = fetchBookDetails;