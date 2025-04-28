import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export async function loadTransactionHistory() {
  const inboxContainer = document.getElementById("history-container");
  try {
    inboxContainer.innerHTML = "<p>Loading history...</p>";
/*
    const sellerQuery = db.collection("requests")
      .where("sellerId", "==", currentUser.uid)
      .where("status", "==", "accepted")
      .orderBy("updatedAt", "desc");

    const buyerQuery = db.collection("requests")
      .where("buyerId", "==", currentUser.uid)
      .where("status", "==", "accepted")
      .orderBy("updatedAt", "desc"); */

    onAuthStateChanged(auth, async (user) => {
      const userQuery = query(collection(db, "Past Transactions"), where("participants", "array-contains", user.email));

      const [/*sellerSnap, buyerSnap,*/ userSnap] = await Promise.all([
        //sellerQuery.get(),
        //buyerQuery.get(),
        getDocs(userQuery)
      ]);

      const transactions = [
        //...sellerSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: "sold" })),
        //...buyerSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: "bought" })),
        ...userSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: "transaction" }))
      ].sort((a, b) => b.lastUpdated - a.lastUpdated);

      if (transactions.length == 0) {
        inboxContainer.innerHTML = `
          <div class="empty-state">
            <p>No transactions found</p>
          </div>
        `;
        return;
      } else {
        inboxContainer.innerHTML = "";
        transactions.forEach(tx => {
          inboxContainer.innerHTML += `
            <div class="thread-card">
              <div class="thread-left">
                <p>${tx.message}</p>
                <div class="content">
                  <div class="main-image">
                    <img src="${tx.textThumbnail || ""}" alt="Book Cover">
                  </div>
                  <div class="details">
                    <p>ISBN: ${tx.textbookISBN}</p>
                    <p>Price: $${tx.textbookPrice}</p>
                    <p>Sold on: ${new Date(tx.lastUpdated).toDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      }
    });
/*
    inboxContainer.innerHTML = "";

    const bookIds = [...new Set(transactions.map(tx => tx.bookId))];
    const booksSnap = await collection(db, "books")
      .where(firebase.firestore.FieldPath.documentId(), "in", bookIds)
      .get();

    const books = {};
    booksSnap.forEach(doc => {
      books[doc.id] = doc.data();
    });

    transactions.forEach(tx => {
      const book = books[tx.bookId] || { title: "Unknown Book" };
      const date = tx.updatedAt?.toDate().toLocaleString();
      const name = tx.type === "sold" ? tx.buyerName : tx.sellerName;
      const role = tx.type === "sold" ? "Buyer" : "Seller";

      const div = document.createElement("div");
      div.className = "thread-card";
      div.innerHTML = `
        <div class="thread-left">
          <strong>${tx.type === "sold" ? `Sold: ${book.title}` : `Bought ${book.title}`}</strong>
          <em>${book.title} - $${tx.price} | ${role}: ${name || "Unknown"}</em>
          <small>${date}</small>
        </div>
      `;
      inboxContainer.appendChild(div);
    }); */
  } catch (error) {
    console.error("Error loading history:", error);
    inboxContainer.innerHTML = `
      <div class="empty-state">
        <p>Error loading history.</p>
        <button onclick="loadTransactionHistory()">Retry</button>
      </div>
    `;
  }
}
