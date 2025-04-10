// Authenticates a user. A user needs to be signed in to access certain pages and functions

// Import from Firebase
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export async function authUser() {
    onAuthStateChanged(auth, (user) => {
            if (!user) { window.location.href = "app.html"; } 
            else { checkVerification(user); }
          }); 
    logoutUser();
}

export async function logoutUser() {
  let logoutTimer;
  const inactivityTime = 900000; // 15 minutes (in milliseconds)

  function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(logout, inactivityTime);
  }

  function logout() {
    auth.signOut().then(() => {
      // Sign-out successful.
      console.log('User logged out due to inactivity.');
      window.location.href = "app.html"; // Redirect to the login page
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);

  // Start the timer initially
  resetTimer();
}

// Automaticlly signs a user out when the app is closed
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    return signInWithEmailAndPassword(auth, email, password);
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing in:", errorCode, errorMessage);
  });

  async function checkVerification(user) {
    if (!user.emailVerified) {
      window.location.href = "verificationWait.html"; // Redirect to the wait page
    }
  }