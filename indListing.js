import { purchaseBook } from "./purchaseTextbook.js";

const result = JSON.parse(localStorage.indListing);

const title = document.getElementById("bookTitle");
const author = document.getElementById("author");
const isbn = document.getElementById("isbn");
const price = document.getElementById("price");
const seller = document.getElementById("seller");
const subject = document.getElementById("subject");
const condition = document.getElementById("condition");
const description = document.getElementById("description");
const thumbnail = document.getElementById("thumbnail");
const front = document.getElementById("front");
const back = document.getElementById("back");
const spine = document.getElementById("spine");
const alert = document.getElementById("alert");

title.innerHTML = result.title;
author.innerHTML += result.author;
isbn.innerHTML += result.isbn_number;
price.innerHTML += result.price;
seller.innerHTML += result.seller.first_name + " " + result.seller.last_name;
subject.innerHTML += result.subject;
condition.innerHTML += result.condition;
description.innerHTML += result.description;
thumbnail.src = result.thumbnail;
front.src = result.front_cover;
back.src = result.back_cover;
spine.src = result.spine;

const purchaseButton = document.getElementById("purchase-button");
purchaseButton.onclick = () => {
    purchaseBook(result.id);
};

const wishlistButton = document.getElementById("wishlist-button");
wishlistButton.onclick = () => {
    const wishlistItem = {
        id: result.id,
        title: result.title,
        author: result.author,
        isbn: result.isbn_number,
        thumbnail: result.thumbnail,
    };

    // Get current wishlist from localStorage (or initialize an empty array)
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Optional: Check if the item already exists to prevent duplicates
    if (!wishlist.some(item => item.id === wishlistItem.id)) {
        wishlist.push(wishlistItem);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        alert.innerHTML = "Added to wishlist!";
        setTimeout(() => { alert.innerHTML = ""; }, 3000);
    } else {
        alert.innerHTML = "Item already in wishlist!";
        setTimeout(() => { alert.innerHTML = ""; }, 3000);
    }
};
