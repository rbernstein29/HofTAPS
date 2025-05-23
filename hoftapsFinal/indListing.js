import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where, arrayUnion } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getUser } from './firebaseInterface.js';
import { authUser } from './authUser.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

authUser(); // Checks if user is signed in

const obj = localStorage.getItem("indListing")
const bookId = JSON.parse(obj);
console.log(bookId);

const bookRef = doc(db, "Textbook Data", bookId);
const bookSnap = await getDoc(bookRef);
const result = bookSnap.data();

const title = document.getElementById("bookTitle");
const author = document.getElementById("author");
const isbn = document.getElementById("isbn");
const price = document.getElementById("price");
const seller = document.getElementById("seller");
const subject = document.getElementById("subject");
const condition = document.getElementById("condition");
const description = document.getElementById("description");
const descDiv = document.getElementById("descDiv");
const thumbnail = document.getElementById("thumbnail");
const front = document.getElementById("front");
const frontText = document.getElementById("frontText");
const backText = document.getElementById("backText");
const spineText = document.getElementById("spineText");
const back = document.getElementById("back");
const spine = document.getElementById("spine");
const alert = document.getElementById("alert");

// Populates html elements with textbook info
title.innerHTML = result.title;
author.innerHTML += result.author;
isbn.innerHTML += result.isbn_number;
price.innerHTML += result.price;
seller.innerHTML += result.seller.first_name + " " + result.seller.last_name;
subject.innerHTML += result.subject;
condition.innerHTML += result.condition;

// Removes empty fields from being displayed
console.log(result.description);
if (result.description == "") {
    description.remove();
    descDiv.remove();
} else {
    description.innerHTML += result.description;
}
if (result.thumbnail == "") {
    thumbnail.remove();
} else {
    thumbnail.src = result.thumbnail;
}
if (result.front_cover == "") {
    front.remove();
    frontText.remove();
} else {
    front.src = result.front_cover;
}
if (result.back_cover == "") {
    back.remove();
    backText.remove();
} else {
    back.src = result.back_cover;
}
if (result.spine == "") {
    spine.remove();
    spineText.remove();
} else {
    spine.src = result.spine;
}

const purchaseButton = document.getElementById("purchase-button");
purchaseButton.onclick = () => {
    if (result.seller.email == auth.currentUser.email) {
        alert.innerHTML = "Cannot purchase your own listing!";
        setTimeout(() => { alert.innerHTML = ""; }, 3000);
    } else {
        localStorage.indListing = JSON.stringify(bookSnap.id);

        window.location.href = "confirmation.html";
    }
};

const wishlistButton = document.getElementById("wishlist-button");
wishlistButton.onclick = () => {
    if (result.seller.email == auth.currentUser.email) {
        alert.innerHTML = "Cannot add you own listing to your wishlist!";
        setTimeout(() => { alert.innerHTML = ""; }, 3000);
    } else {
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
                                                    wishlist: arrayUnion(bookRef)
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
    }
    
};


