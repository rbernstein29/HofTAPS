// Import from Firebase SDK
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { doc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, arrayRemove, collection, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getUser, getTextbook } from './firebaseInterface.js';
import { authUser } from './authUser.js';
import { showToast } from './notifications-integrated.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export async function purchaseBook(target) {
    // Checks if user is signed in
    authUser();

    /*const textbookRef = await doc(db, "Textbook Data", target.id);
    const textbookSnap = await getDoc(textbookRef);
    const textbook = textbookSnap.data();*/
    const textbook = target;

    const docRef = query(collection(db, "User Data"), where("uid", "==", auth.currentUser.uid));   // Gets user with matching email
    const docSnap = await getDocs(docRef);
    const snap = docSnap.docs[0];     // There should only be one result - each email is unique
    const user = snap.data();

    await addDoc(collection(db, "messages"), {
        participants: [user.uid, textbook.seller],
        sentByUser: user,
        sentById: user.uid,
        sentToUser: textbook.seller,
        sentToId: textbook.seller.uid,
        lastUpdated: Date.now(),
        archived: [],
        message: `${user.first_name} wishes to purchase ${textbook.title} by ${textbook.author}.`,
        textbookTitle: textbook.title,
        textbookAuthor: textbook.author,
        textbookId: target,//textbookSnap.id,
        type: "request"
    });

    showToast("success", "Request to purchase sent to seller.");
}

// Delete Textbook Entry
export async function deleteTextbook(toDelete) {
    const docRef = doc(db, "Textbook Data", toDelete);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      await deleteDoc(docRef);
      console.log("DOCUMENT SUCCESSFULLY DELETED");
    } else {
      console.log("DOCUMENT NOT FOUND");
    }
}

