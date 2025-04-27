//Optional: if inline HTML page

/*
 historyTab.onclick = () => { setActiveTab("history"); };

    function setActiveTab(tab) {
      currentTab = tab;
      [inboxTab, offersTab, archivedTab, historyTab].forEach(btn => {
        btn.classList.toggle("active", btn.id === `${tab}-tab`);
      });
      loadThreads();
    }
*/

    async function loadTransactionHistory() {
  try {
    inboxContainer.innerHTML = "<p>Loading history...</p>";

    const sellerQuery = db.collection("requests")
      .where("sellerId", "==", currentUser.uid)
      .where("status", "==", "accepted")
      .orderBy("updatedAt", "desc");

    const buyerQuery = db.collection("requests")
      .where("buyerId", "==", currentUser.uid)
      .where("status", "==", "accepted")
      .orderBy("updatedAt", "desc");

    const [sellerSnap, buyerSnap] = await Promise.all([
      sellerQuery.get(),
      buyerQuery.get()
    ]);

    const transactions = [
      ...sellerSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: "sold" })),
      ...buyerSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: "bought" }))
    ].sort((a, b) => b.updatedAt?.toDate() - a.updatedAt?.toDate());

    if (transactions.length === 0) {
      inboxContainer.innerHTML = `
        <div class="empty-state">
          <p>No transactions found</p>
        </div>
      `;
      return;
    }

    inboxContainer.innerHTML = "";

    const bookIds = [...new Set(transactions.map(tx => tx.bookId))];
    const booksSnap = await db.collection("books")
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
    });
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
