import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"
import { getFirestore, doc, getDocs, query, collection, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* test */ const accountDetails = document.querySelector('.hidden-container');

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
      document.getElementById("user-name").innerText = userData.first_name;
      document.getElementById("h_num").innerText = userData.h_number;
      document.getElementById("f_name").innerText = userData.first_name;
      document.getElementById("l_name").innerText = userData.last_name;
      document.getElementById("mail").innerText = user.email;
    

      document.getElementById("profile-container").style.display = "block";
    } else {  // No user with email found
      console.log("DOCUMENT NOT FOUND");
    }
  }
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

