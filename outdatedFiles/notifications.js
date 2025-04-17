import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase config
export const firebaseConfig = {
    apiKey: "AIzaSyCVmx7rzCJf84-dhvbtVbCud9XN5BaGars",
    authDomain: "hoftaps-db6f8.firebaseapp.com",
    projectId: "hoftaps-db6f8",
    storageBucket: "hoftaps-db6f8.firebasestorage.app",
    messagingSenderId: "1009832415546",
    appId: "1:1009832415546:web:55f3c5351cda418f6f4003",
    measurementId: "G-W6Q2E49PEK"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);



function loadListings() {
  const container = document.getElementById("listings-container");
  const ref = db.ref ? db.ref("Listing Data") : null;

  container.innerHTML = '<h2 class="text-white text-center">My Notifications</h2>';

  if (!ref) return;

  ref.once("value").then(snapshot => {
    const data = snapshot.val();

    if (data) {
      Object.entries(data).forEach(([listingId, listing]) => {
        const card = document.createElement("div");
        card.className = "card mb-3 bg-light text-dark";

        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">Author: ${author} | Price: $${price}</p>
            <button class="btn btn-warning" onclick="sendNotificationToSeller(this, '${userId}', '${title}')">
              Notify Seller
            </button>
          </div>
        `;

        container.appendChild(card);
      });
    } else {
      container.innerHTML += '<p class="text-white text-center">No notifications found.</p>';
    }
  });
}

// Send notification
window.sendNotificationToSeller = function (buttonElement, sellerId, bookTitle) {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be signed in to send notifications.");
    return;
  }

  const message = `Hi! I'm interested in your book: "${title}".`;
  const notifRef = db.ref(`Notifications/${userId}`).push();

  notifRef.set({
    senderId: user.uid,
    senderEmail: user.email || "Anonymous",
    message: message,
    timestamp: new Date().toISOString(),
    read: false
  }).then(() => {
    alert("Notification sent!");
    buttonElement.disabled = true;
    buttonElement.innerText = "Notification Sent";
  }).catch(error => {
    console.error("Error sending notification:", error);
  });
};


function loadNotifications() {
  onAuthStateChanged(auth, user => {
    if (!user) return;

    const ref = db.ref(`Notifications/${user.uid}`);
    const badge = document.getElementById("notification-badge");

    ref.on("value", snapshot => {
      let count = 0;
      const data = snapshot.val();
      if (data) {
        Object.values(data).forEach(n => {
          if (!n.read) count++;
        });
      }

      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "inline-block" : "none";
      }
    });
  });
}


onAuthStateChanged(auth, user => {
  if (user) {
    loadListings();
    loadNotifications();
  }
});
