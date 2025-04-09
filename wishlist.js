import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where, arrayRemove } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getUser } from './firebaseInterface.js';

document.addEventListener("DOMContentLoaded", () => {
    const wishlistContainer = document.getElementById("wishlist-container");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
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
                    isbn.innerHTML = `<strong>ISBN:</strong> ${item.isbn_number}`;

                    // Append details to the details container
                    details.appendChild(title);
                    details.appendChild(author);
                    details.appendChild(isbn);

                    const removeBtn = document.createElement("button");
                    removeBtn.className = "remove-btn";
                    removeBtn.textContent = "Remove from Wishlist";
                    removeBtn.onclick = () => {
                        // Remove item from wishlist and update localStorage
                        onAuthStateChanged(auth, (user) => {
                                    getUser(user.email)
                                    .then((result) => {
                                        const removeListing = async () => {
                                            try {
                                                //  Removes listing from user's listings
                                                await updateDoc(result, {
                                                    wishlist: arrayRemove(item)
                                                });
                                                console.log("Listing removed:", userData.wishlist)
                                            } catch (error) {
                                                console.error("Error updating user listings:", error);
                                            }
                                        }
                                    removeListing();
                                    })
                                });
                        // Remove the card from the DOM
                        bookCard.remove();
                    };

                    bookCard.onclick = () => {
                        localStorage.indListing = JSON.stringify(item);
        
                        window.location.href = "indListing.html";
                    }

                    bookCard.appendChild(img);
                    bookCard.appendChild(details);
                    bookCard.appendChild(removeBtn);

                wishlistContainer.appendChild(bookCard);
                });
            }
        } else {  // No user with email found
            console.log("DOCUMENT NOT FOUND");
          }
    });
});
