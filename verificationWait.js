import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth();

const verifyButton = document.getElementById("verifyButton");
const alertMessage = document.getElementById("alertMessage");

onAuthStateChanged(auth, (user) => {
    if (user.emailVerified) {
        window.location.href = "HTAPHome.html";
    }
});

verifyButton.onclick = async () => {
    const user = auth.currentUser;
    if (user) {
        alertMessage.innerHTML = "Verification email sent. Please check your inbox.";
        await sendEmailVerification(user);

    } else {
        alertMessage.innerHTML = "No user is currently signed in.";
    }
}