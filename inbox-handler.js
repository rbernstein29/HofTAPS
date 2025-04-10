import { auth, db } from "firebase-config.js";
import { showToast } from "notifications.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let currentUser = null;
let currentTab = "inbox";

const inboxContainer = document.getElementById("inbox-threads");
const inboxTab = document.getElementById("inbox-tab");
const archivedTab = document.getElementById("archived-tab");

auth.onAuthStateChanged(async user => {
  if (!user) {
    showToast("Error", "Please log in to view your inbox.");
    window.location.href = ".html"; //When integrating, put the correct file here (login page)
    return;
  }
  currentUser = user;
  loadThreads();
});

inboxTab.onclick = () => {
  currentTab = "inbox";
  inboxTab.classList.add("active");
  archivedTab.classList.remove("active");
  loadThreads();
};

archivedTab.onclick = () => {
  currentTab = "archived";
  archivedTab.classList.add("active");
  inboxTab.classList.remove("active");
  loadThreads();
};

async function loadThreads() {
  if (!currentUser) return;
  inboxContainer.innerHTML = "<p>Loading...</p>";

  const q = query(
    collection(db, "messages"),
    where("participants", "array-contains", currentUser.uid),
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
    const other = thread.participantNames?.find(p => p.uid !== currentUser.uid);
    const isRead = thread.readBy?.includes(currentUser.uid);
    const statusIcon = isRead ? '✅' : '❌';

    const div = document.createElement("div");
    div.className = "thread-card";
    div.innerHTML = `
      <div class="thread-left">
        <strong>${other?.name || 'Unknown'}</strong><br>
        <em>${thread.lastMessage?.text || 'No message yet'}</em><br>
        <small>${new Date(thread.lastUpdated.toDate()).toLocaleString()}</small>
      </div>
      <div class="thread-actions">
        <button class="btn btn-sm btn-outline-success" onclick="archiveThread('${docRef.id}')">✅</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteThread('${docRef.id}')">❌</button>
      </div>
    `;
    inboxContainer.appendChild(div);
  });
}

window.archiveThread = async (threadId) => {
  try {
    await updateDoc(doc(db, "messages", threadId), {
      archivedBy: [...(await getDoc(doc(db, "messages", threadId))).data().archivedBy || [], currentUser.uid]
    });
    showToast("Success", "Thread archived.");
    loadThreads();
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
    loadThreads();
  } catch (err) {
    console.error("Delete error:", err);
    showToast("Error", "Could not delete thread.");
  }
};
