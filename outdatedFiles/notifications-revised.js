import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  onValue,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);



onAuthStateChanged(auth, user => {
  if (!user) return;

  document.getElementById("login-section").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  loadInbox(user);
  loadListings(user);
});


function loadListings(user) {
  const refListings = ref(db, 'Listing Data');
  const container = document.getElementById("listings-container");

  get(refListings).then(snapshot => {
    container.innerHTML = '';
    const data = snapshot.val();

    if (data) {
      Object.entries(data).forEach(([id, listing]) => {
        const { title, author, price, sellerId } = listing;
        if (sellerId === user.uid) return; 

        const div = document.createElement("div");
        div.className = "col-md-4";
        div.innerHTML = `
          <div class="card bg-light text-dark mb-3">
            <div class="card-body">
              <h5>${title}</h5>
              <p>${author} - $${price}</p>
              <button class="btn btn-warning" onclick="sendNotif('${sellerId}', '${title}')">
                Notify Seller
              </button>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    }
  });
}


window.sendNotif = function(sellerId, bookTitle) {
  const user = auth.currentUser;
  if (!user) return;

  const notifRef = push(ref(db, `Notifications/${sellerId}`));
  set(notifRef, {
    senderId: user.uid,
    senderEmail: user.email,
    message: `Hi! I'm interested in your book: "${bookTitle}"`,
    timestamp: new Date().toISOString(),
    read: false
  }).then(() => alert("📤 Notification sent!"));
};


function loadInbox(user) {
  const notifRef = ref(db, `Notifications/${user.uid}`);
  const notifList = document.getElementById("notif-list");
  const badge = document.getElementById("notification-badge");

  onValue(notifRef, snapshot => {
    const data = snapshot.val();
    let unreadCount = 0;
    notifList.innerHTML = '';

    if (data) {
      Object.entries(data).forEach(([id, notif]) => {
        const { message, senderEmail, read, timestamp } = notif;
        if (!read) unreadCount++;

        const li = document.createElement("li");
        li.className = `list-group-item d-flex justify-content-between align-items-center ${read ? 'bg-secondary text-white' : ''}`;
        li.innerHTML = `
          <div>
            <strong>${senderEmail}</strong><br/>
            ${message}<br/>
            <small>${new Date(timestamp).toLocaleString()}</small>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-light" onclick="markRead('${user.uid}', '${id}', ${!read})">
              ${read ? 'Mark Unread' : 'Mark Read'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteNotif('${user.uid}', '${id}')">🗑️</button>
          </div>
        `;
        notifList.appendChild(li);
      });
    } else {
      notifList.innerHTML = '<li class="list-group-item text-muted">No messages found.</li>';
    }

    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  });
}


window.markRead = function(userId, notifId, status) {
  const notifRef = ref(db, `Notifications/${userId}/${notifId}`);
  update(notifRef, { read: status });
};


window.deleteNotif = function(userId, notifId) {
  const notifRef = ref(db, `Notifications/${userId}/${notifId}`);
  remove(notifRef);
};
