import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";


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
    const uid = user.uid;

    // Refresh user auth data
    user.reload().then(() => {
      // Access updated user info if needed, e.g., user.emailVerified
      console.log("User data reloaded successfully.");
    }).catch((error) => {
      console.error("Error reloading user data:", error);
    });

    const docRef = query(collection(db, "User Data"), where("uid", "==", uid));   // Gets user with matching email
    const docSnap = await getDocs(docRef);
    
    const snap = docSnap.docs[0];     // There should only be one result - each email is unique
     

    if (snap) {
      const userData = snap.data();
      console.log("User data retrieved:", userData);
      // Update the account page DOM with the retrieved data
      document.getElementById("name").innerText = userData.first_name;
      document.getElementById("h_num").innerText = userData.h_number;
      document.getElementById("f_name").innerText = userData.first_name;
      document.getElementById("l_name").innerText = userData.last_name;
      document.getElementById("email").innerText = user.email;
      

      document.getElementById("profile-container").style.display = "block";

      //listings
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
        author.innerHTML = `${book.author}`;

        const price = document.createElement("p");
        price.innerHTML = `<strong>$${book.price}</strong>`;

        const isbn = document.createElement("p");
        isbn.innerHTML = `<strong>ISBN:</strong> ${book.isbn_number}`;


        const removeButton = document.createElement("button");
        removeButton.className = "remove-btn";
        removeButton.innerText = "Remove";
        removeButton.onclick = async () => {
          purchaseBook(bookRef.id);
          // Remove the book card from the DOM
          listings.removeChild(bookCard);
        };

        bookCard.onclick = () => {
          localStorage.indListing = JSON.stringify(book);

          window.location.href = "indListing.html";
        }


       // Append details to the details container
       details.appendChild(title);
       details.appendChild(author);
       details.appendChild(price);
       details.appendChild(isbn);
       bookCard.appendChild(img);
       bookCard.appendChild(details);
       bookCard.appendChild(removeButton);
       listings.appendChild(bookCard);
     });

      
    } else {
      console.log("DOCUMENT NOT FOUND");
    }
    
  }

  console.log(auth.currentUser.uid);


}); 

// Edit button functionality with enhanced logging
document.querySelector('.edit-btn').addEventListener('click', async () => {
  console.log("Edit button clicked. isEditing =", isEditing);

  // Toggle to edit mode
  if (!isEditing) {
    const fNameSpan = document.getElementById("f_name");
    const lNameSpan = document.getElementById("l_name");

    // Get current values
    const fNameVal = fNameSpan.innerText;
    const lNameVal = lNameSpan.innerText;

    // Replace text with input fields
    fNameSpan.innerHTML = `<input type="text" id="f_name_input" value="${fNameVal}" />`;
    lNameSpan.innerHTML = `<input type="text" id="l_name_input" value="${lNameVal}" />`;

    // Change button text to Save
    document.querySelector('.edit-btn').innerText = "Save";
    isEditing = true;
    console.log("Switched to edit mode.");

    // show reset password button
    document.querySelector(".reset-password").style.display = "block";

  } else {
    // Retrieve new input values
    const fNameNew = document.getElementById("f_name_input").value;
    const lNameNew = document.getElementById("l_name_input").value;

    console.log("Attempting to save new data:", { fNameNew, lNameNew });

    try {
      // Update Firestore document; email is not updated
      const docRef = query(collection(db, "User Data"), where("uid", "==", auth.currentUser.uid));   // Gets user with matching email
      const docSnap = await getDocs(docRef);
    
      const snap = docSnap.docs[0];     // There should only be one result - each email is unique
      const userDocRef = doc(db, "User Data", snap.id);
      await updateDoc(userDocRef, {
        first_name: fNameNew,
        last_name: lNameNew
      });
      console.log("Profile updated successfully.");
      

      // Fetch the document again for verification
      const updatedDocSnap = await getDoc(userDocRef, { source: "server" });
      console.log("Updated document:", updatedDocSnap.data());


      // Revert input fields back to plain text
      document.getElementById("f_name").innerText = fNameNew;
      document.getElementById("l_name").innerText = lNameNew;

      // Change button text back to Edit Profile and exit edit mode
      document.querySelector('.edit-btn').innerText = "Edit Profile";
      isEditing = false;
      console.log("Switched back to view mode.");

      // Hide reset password button
      document.querySelector(".reset-password").style.display = "none";
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally, you can show an error message on the UI
    }
  }
});


// Password reset functionality for a logged-in user
document.querySelector(".reset-password").addEventListener("click", async () => {
  if (auth.currentUser && auth.currentUser.email) {
    // Get the current authenticated user email
    const userEmail = auth.currentUser.email;
    try {
      // Send the password reset email
      await sendPasswordResetEmail(auth, userEmail);
      console.log("Password reset email sent successfully to:", userEmail);
      alert("A password reset email has been sent to " + userEmail + ". Please check your inbox (and spam folder).");
    } catch (error) {
      // Show any errors
      console.error("Error sending password reset email:", error);
      alert("Error sending password reset email: " + error.message);
    }
  } else {
    // error case for user not logged in
    console.error("No user logged in.");
    alert("No user is currently logged in.");
  }
});
