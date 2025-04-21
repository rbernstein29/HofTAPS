import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 
import { firebaseConfig } from "./hoftapsFirebaseConfig.js";
import { purchaseBook } from "./purchaseTextbook.js";
import { authUser } from './authUser.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

authUser(); // Checks if user is signed in

const obj = localStorage.getItem("indListing")
const bookId = JSON.parse(obj);

const bookRef = doc(db, "Textbook Data", bookId);
const bookSnap = await getDoc(bookRef);
const result = bookSnap.data();

const title = document.getElementById("bookTitle");
const author = document.getElementById("author");
const isbn = document.getElementById("isbn");
const price = document.getElementById("price");
const seller = document.getElementById("seller");
const thumbnail = document.getElementById("thumbnail");
const heading = document.getElementById("heading");
const confirmation = document.getElementById("confirmation");

title.innerHTML = result.title;
author.innerHTML += result.author;
isbn.innerHTML += result.isbn_number;
price.innerHTML += result.price;
seller.innerHTML += result.seller.first_name + " " + result.seller.last_name;
thumbnail.src = result.thumbnail;

const purchaseButton = document.getElementById("purchase-button");
purchaseButton.onclick = () => {
    purchaseBook(bookSnap.id);

    heading.innerHTML = "Purchase Request Sent";
    confirmation.innerHTML = "A notification has been sent to the seller. You will receive confirmation once the seller has accepted or declined your request.";

}