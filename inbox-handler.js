// Import from Firebase SDK
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { showToast } from "./notifications-integrated.js";
import { deleteTextbook } from './purchaseTextbook.js';
import { getUser } from './firebaseInterface.js';
import { authUser } from './authUser.js';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

authUser();

let currentUser = null;
let currentTab = "inbox";

const inboxContainer = document.getElementById("inbox-threads");
const inboxTab = document.getElementById("inbox-tab");
const archivedTab = document.getElementById("archived-tab");

auth.onAuthStateChanged(async user => {
  if (!user) {
    showToast("Error", "Please log in to view your inbox.");
    window.location.href = "app.html";
    return;
  }
  currentUser = user;
  loadInbox();
});

inboxTab.onclick = () => {
  currentTab = "inbox";
  inboxTab.classList.add("active");
  archivedTab.classList.remove("active");
  loadInbox();
};

archivedTab.onclick = () => {
  currentTab = "archived";
  archivedTab.classList.add("active");
  inboxTab.classList.remove("active");
  loadArchive();
};

async function loadInbox() {
  if (!currentUser) return;
  inboxContainer.innerHTML = "<p>Loading...</p>";

  const q = query(
    collection(db, "messages"),
    where("sentToId", "==", currentUser.uid),
    orderBy("lastUpdated", "desc")
  );

  const snapshot = await getDocs(q);
  const filtered = snapshot.docs.filter(doc => {
    const data = doc.data();
    const archived = data.archivedBy?.includes(currentUser.uid);
    return currentTab === "inbox" ? !archived : archived;
  });

  inboxContainer.innerHTML = filtered.length === 0
    ? "<p>No conversations found.</p>"
    : "";

  filtered.forEach(docRef => {
    const thread = docRef.data();
    const other = thread.sentByUser;
    const isRead = thread.readBy?.includes(currentUser.uid);
    const statusIcon = isRead ? 'Accept' : 'Decline';

    const div = document.createElement("div");
    div.className = "thread-card";
    div.innerHTML = `
      <div class="thread-left">
        <strong>${other.first_name + " " + other.last_name || 'Unknown'}</strong><br>
        <em>${thread.message || 'No message yet'}</em><br>
        <small>${new Date(thread.lastUpdated).toLocaleString()}</small>
      </div>
      `;
    if (thread.type === "request") {
      div.innerHTML += `
      <div class="thread-actions">
        <button class="btn btn-sm btn-outline-success" id="acceptButton" onclick="acceptSale('${docRef.id}', '${thread.textbookTitle}', '${thread.textbookAuthor}', '${thread.textbookId}')">Accept</button>
        <button class="btn btn-sm btn-outline-danger" id="declineButton" onclick="declineSale('${docRef.id}', '${thread.textbookTitle}', '${thread.textbookAuthor}',)">Decline</button>
      </div>
      `;
    }
    else {
      div.innerHTML += `
      <div class="thread-actions">
        <button class="btn btn-sm btn-outline-warning" id="archiveButton" onclick="archiveThread('${docRef.id}')">Dismiss</button>
      </div>
      `;
    }
    inboxContainer.appendChild(div);
  });
}

async function loadArchive() {
  if (!currentUser) return;
  inboxContainer.innerHTML = "<p>Loading...</p>";

  const q = query(
    collection(db, "messages"),
    where("sentToId", "==", currentUser.uid),
    orderBy("lastUpdated", "desc")
  );

  const snapshot = await getDocs(q);
  const filtered = snapshot.docs.filter(doc => {
    const data = doc.data();
    const archived = data.archivedBy?.includes(currentUser.uid);
    return currentTab === "inbox" ? !archived : archived;
  });

  inboxContainer.innerHTML = filtered.length === 0
    ? "<p>No conversations found.</p>"
    : "";

  filtered.forEach(docRef => {
    const thread = docRef.data();
    const other = thread.sentByUser;
    const isRead = thread.readBy?.includes(currentUser.uid);
    const statusIcon = isRead ? 'Accept' : 'Decline';

    const div = document.createElement("div");
    div.className = "thread-card";
    div.innerHTML = `
      <div class="thread-left">
        <strong>${other.first_name + " " + other.last_name || 'Unknown'}</strong><br>
        <em>${thread.message || 'No message yet'}</em><br>
        <small>${new Date(thread.lastUpdated).toLocaleString()}</small>
      </div>
      <div class="thread-actions">
          <button class="btn btn-sm btn-outline-danger" id="deleteButton" onclick="deleteThread('${docRef.id}')">Delete Message</button>
      </div>
    `;
    inboxContainer.appendChild(div);
  });
}

window.acceptSale = async (threadId, textbookTitle, textbookAuthor, textbookId) => {
  const textbookRef = doc(db, "Textbook Data", textbookId)
  const threadSnap = await getDoc(doc(db, "messages", threadId));
  const thread = threadSnap.data();
  await addDoc(collection(db, "messages"), {
    participants: thread.participants,
    sentByUser: thread.sentToUser,
    sentById: thread.sentToId,
    sentToUser: thread.sentByUser,
    sentToId: thread.sentById,
    lastUpdated: Date.now(),
    archived: [],
    message: `${thread.sentToUser.first_name} has accepted your purchase of ${textbookTitle} by ${textbookAuthor}.`,
    type: "confirmation"
  });
  onAuthStateChanged(auth, (user) => {
    getUser(user.email)
    .then((result) => {
        const removeListing = async () => {
            try {
                //  Removes listing from user's listings
                await updateDoc(result, {
                    listings: arrayRemove(textbookRef)
                });
                console.log("Listing removed")
            } catch (error) {
                console.error("Error updating user listings:", error);
            }
        }
    removeListing();
    })
  });
  deleteTextbook(textbookId);
  archiveThread(threadId); 
}

window.declineSale = async (threadId, textbookTitle, textbookAuthor) => {
  const threadSnap = await getDoc(doc(db, "messages", threadId));
  const thread = threadSnap.data();
  await addDoc(collection(db, "messages"), {
    participants: thread.participants,
    sentByUser: thread.sentToUser,
    sentById: thread.sentToId,
    sentToUser: thread.sentByUser,
    sentToId: thread.sentById,
    lastUpdated: Date.now(),
    archived: [],
    message: `${thread.sentToUser.first_name} has declined your request to purchase ${textbookTitle} by ${textbookAuthor}.`,
    type: "confirmation"
  });
  archiveThread(threadId); 
}

window.archiveThread = async (threadId) => {
  try {
    await updateDoc(doc(db, "messages", threadId), {
      archivedBy: [...(await getDoc(doc(db, "messages", threadId))).data().archivedBy || [], currentUser.uid]
    });
    showToast("Success", "Thread archived.");
    loadInbox();
  } catch (err) {
    console.error("Archive error:", err);
    showToast("Error", "Could not archive thread.");
  }
};

window.deleteThread = async (threadId) => {
  if (!confirm("Are you sure you want to delete this conversation forever?")) return;
  try {
    await deleteDoc(doc(db, "messages", threadId));
    showToast("Warning", "Thread deleted.");
    loadArchive();
  } catch (err) {
    console.error("Delete error:", err);
    showToast("Error", "Could not delete thread.");
  }
};
