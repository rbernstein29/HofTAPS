import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { firebaseConfig } from "./hoftapsFirebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get the container where the user-specific links will be inserted
const userLinks = document.getElementById("userLinks");

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // If user is signed in, show Account Profile and Sign Out links
    userLinks.innerHTML = `
      <a href="profile.html" class="d-block p-2 text-decoration-none">Account Profile</a>
      <a href="notifications.html" class="d-block p-2 text-decoration-none">Notifications</a>
      <a href="#" class="d-block p-2 text-decoration-none">Listings</a>
      <a href="#" class="d-block p-2 text-decoration-none">Settings</a>
      <a href="#" class="d-block p-2 text-decoration-none">Wishlist</a>
      <a href="#" id="signOutLink" class="d-block p-2 text-decoration-none">Sign Out</a>
    `;
    // Attach event listener for Sign Out
    document.getElementById("signOutLink").addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        // Refresh or update UI after sign out
        window.location.reload();
      } catch (error) {
        console.error("Error signing out:", error);
        alert("Error signing out. Please try again.");
      }
    });
  } else {
    // If no user is signed in, show the Sign In link
    userLinks.innerHTML = `
      <a href="login.html" class="d-block p-2 text-decoration-none">Sign In</a>
    `;
  }
});
