import { purchaseBook } from "./purchaseTextbook.js";
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where, arrayUnion } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getUser } from './firebaseInterface.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
    onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
        
                // Refresh user auth data
                user.reload().then(() => {
                // Access updated user info if needed, e.g., user.emailVerified
                console.log("User data reloaded successfully.");
                }).catch((error) => {
                console.error("Error reloading user data:", error);
                });
        
                const docRef = query(collection(db, "User Data"), where("email", "==", email));   // Gets user with matching email
                const docSnap = await getDocs(docRef);
            
                const snap = docSnap.docs[0];     // There should only be one result - each email is unique
                if (snap) {
                    const userData = snap.data();
                    console.log("User data retrieved:", userData);
            
                    const wishlist = userData.wishlist || [];
            
                    if (wishlist.includes(result) == false) {
                        onAuthStateChanged(auth, (user) => {
                                    getUser(user.email)
                                    .then((currUser) => {
                                        const addListing = async () => {
                                            try {
                                                // Adds new listing to user's listings
                                                await updateDoc(currUser, {
                                                    wishlist: arrayUnion(result)
                                                });
                                                alert.innerHTML = "Added to wishlist!";
                                                setTimeout(() => { alert.innerHTML = ""; }, 3000);
                                            } catch (error) {
                                                console.error("Error updating user listings:", error);
                                            }
                                        }
                                    addListing();
                                    })
                                });
                    } else {
                        alert.innerHTML = "Item already in wishlist!";
                        setTimeout(() => { alert.innerHTML = ""; }, 3000);
                    }
                } else {  // No user with email found
                    console.log("DOCUMENT NOT FOUND");
                  }
            }
        });
    
};
