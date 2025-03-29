// Import from Firebase SDK
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getUser, getTextbook } from './firebaseInterface.js';
import { authUser } from './authUser.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

export async function purchaseBook(target) {
    // Checks if user is signed in
    authUser();

    getTextbook(target).then((textbook) => {
        // Removes the textbook above from the user's listings in Firebase
        onAuthStateChanged(auth, (user) => {
            getUser(user.email)
            .then((result) => {
                const removeListing = async () => {
                    try {
                        //  Removes listing from user's listings
                        await updateDoc(result, {
                            listings: arrayRemove(textbook)
                        });
                        console.log("Listing removed")
                    } catch (error) {
                        console.error("Error updating user listings:", error);
                    }
                }
            removeListing();
            })
        });
    });

    deleteTextbook(target);
}

// Delete Textbook Entry
async function deleteTextbook(toDelete) {
    const docRef = doc(db, "Textbook Data", toDelete);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      await deleteDoc(docRef);
      console.log("DOCUMENT SUCCESSFULLY DELETED");
    } else {
      console.log("DOCUMENT NOT FOUND");
    }
}

