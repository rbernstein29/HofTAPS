import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { purchaseBook } from "./purchaseTextbook.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);



// Log Out
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log('User signed out.');
    // Hide profile container and signup container
  document.getElementById("profile-container").style.display = "none";
  document.querySelector(".signup-container").style.display = "none";
    // Show signup container
  document.querySelector(".login-container").style.display = "block";
    })

    .catch((error) => {
      // Handle errors here
      console.error("Error signing out: ", error);
    });
});



// Global variable to keep track of edit mode
let isEditing = false;



// Retrieve and display user data on account page
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
      // Update the account page DOM with the retrieved data
      document.getElementById("user-name").innerText = userData.first_name;
      document.getElementById("h_num").innerText = userData.h_number;
      document.getElementById("f_name").innerText = userData.first_name;
      document.getElementById("l_name").innerText = userData.last_name;
    

      document.getElementById("profile-container").style.display = "block";

      const listings = document.getElementById("books-container");
      userData.listings.forEach(async (result) => {
        const bookRef = doc(db, "Textbook Data", result.id);  // Get the document reference for the book
        const bookSnap = await getDoc(bookRef);  // Get the document snapshot
        const book = bookSnap.data();

        const bookCard = document.createElement("div");
        bookCard.className = "book-card";

        const img = document.createElement("img");
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

        const removeButton = document.createElement("button");
        removeButton.className = "remove-btn";
        removeButton.innerText = "Remove";
        removeButton.onclick = async () => {
          purchaseBook(bookRef.id);

          // Remove the book card from the DOM
          listings.removeChild(bookCard);
        }

        // Append details to the details container
        details.appendChild(title);
        details.appendChild(author);
        details.appendChild(isbn);
        bookCard.appendChild(img);
        bookCard.appendChild(details);
        bookCard.appendChild(removeButton);
        listings.appendChild(bookCard);
      }); 
    } else {  // No user with email found
      console.log("DOCUMENT NOT FOUND");
    }


  }

  console.log(auth.currentUser.uid);


}); 




/*
const dummyData = {
  h_number: "H700123456",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com"
};

document.getElementById("h_num").innerText = dummyData.h_number;
document.getElementById("f_name").innerText = dummyData.first_name;
document.getElementById("l_name").innerText = dummyData.last_name;
document.getElementById("mail").innerText = dummyData.email;

document.getElementById("profile-container").style.display = "block";
*/

// Edit button functionality with enhanced logging
document.querySelector('.edit-btn').addEventListener('click', async () => {
  console.log("Edit button clicked. isEditing =", isEditing);

  // Toggle to edit mode
  if (!isEditing) {
    const hNumSpan = document.getElementById("h_num");
    const fNameSpan = document.getElementById("f_name");
    const lNameSpan = document.getElementById("l_name");

    // Get current values
    const hNumVal = hNumSpan.innerText;
    const fNameVal = fNameSpan.innerText;
    const lNameVal = lNameSpan.innerText;

    // Replace text with input fields
    hNumSpan.innerHTML = `<input type="text" id="h_num_input" value="${hNumVal}" />`;
    fNameSpan.innerHTML = `<input type="text" id="f_name_input" value="${fNameVal}" />`;
    lNameSpan.innerHTML = `<input type="text" id="l_name_input" value="${lNameVal}" />`;

    // Change button text to Save
    document.querySelector('.edit-btn').innerText = "Save";
    isEditing = true;
    console.log("Switched to edit mode.");
  } else {
    // Retrieve new input values
    const hNumNew = document.getElementById("h_num_input").value;
    const fNameNew = document.getElementById("f_name_input").value;
    const lNameNew = document.getElementById("l_name_input").value;

    console.log("Attempting to save new data:", { hNumNew, fNameNew, lNameNew });

    try {
      // Update Firestore document; email is not updated
      const userDocRef = doc(db, "User Data", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        h_number: hNumNew,
        first_name: fNameNew,
        last_name: lNameNew
      });
      console.log("Profile updated successfully.");
      

      // Fetch the document again for verification
      const updatedDocSnap = await getDoc(userDocRef, { source: "server" });
      console.log("Updated document:", updatedDocSnap.data());


      // Revert input fields back to plain text
      document.getElementById("h_num").innerText = hNumNew;
      document.getElementById("f_name").innerText = fNameNew;
      document.getElementById("l_name").innerText = lNameNew;

      // Change button text back to Edit Profile and exit edit mode
      document.querySelector('.edit-btn').innerText = "Edit Profile";
      isEditing = false;
      console.log("Switched back to view mode.");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally, you can show an error message on the UI
    }
  }
});