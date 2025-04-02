import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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