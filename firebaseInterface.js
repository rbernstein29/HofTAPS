// Import from Firebase SDK
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { collection, doc, addDoc, getDoc, 
  getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Create User Entry
export async function addUser(f_name, l_name, mail, h_num) {
  await addDoc(collection(db, "User Data"), {
    first_name: f_name,     // users first name
    last_name: l_name,      // users last name
    email: mail,            // users email
    h_number: h_num,        // users id number
    listings: [],           // users listings
    wishlist: []            // users wishlist
  });
}

// Create Textbook Entry
async function addTextbook(text_title, text_author, text_isbn, text_edition, text_subject) {
  await addDoc(collection(db, "Textbook Data"), {
    title: text_title,      // textbook title
    author: text_author,    // textbook author
    isbn_number: text_isbn, // textbook isbn number
    edition: text_edition,  // textbook edition
    subject: text_subject   // textbook subject
  });
}

// Create Listing Entry 
async function addListing(text_title, text_author, text_isbn, text_edition, text_subject, text_condition, text_price, text_description) {
  await addDoc(collection(db, "Listing Data"), {
    title: text_title,            // textbook title
    author: text_author,          // textbook author
    isbn_number: text_isbn,       // textbook isbn number
    edition: text_edition,        // textbook edition
    subject: text_subject,        // textbook subject
    condition: text_condition,    // textbook condition
    price: text_price,            // textbook price
    description: text_description // textbook description
  });
}

// Delete User Entry 
async function deleteUser(toDelete) {
  const docRef = doc(db, "User Data", toDelete);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await deleteDoc(docRef);
    console.log("DOCUMENT SUCCESSFULLY DELETED");
  } else {
    console.log("DOCUMENT NOT FOUND");
  }
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

// Read and Return User Entry
export async function getUser(toGet) {
  const docRef = query(collection(db, "User Data"), where("email", "==", toGet));   // Gets user with matching email
  const docSnap = await getDocs(docRef);

  const snap = docSnap.docs[0];     // There should only be one result - each email is unique
  if (snap) {
    return doc(db, "User Data", snap.id);
  } else {  // No user with email found
    console.log("DOCUMENT NOT FOUND");
  }
}

// Read Textbook Entry
async function getTextbook(toGet) {
  const docRef = doc(db, "Textbook Data", toGet);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log(docSnap.id, " => ", docSnap.data());
    return docSnap.data();
  } else {
    console.log("DOCUMENT NOT FOUND");
  }
}

const userQuery = query(collection(db, "User Data"));
const textQuery = query(collection(db, "Textbook Data"));
const listQuery = query(collection(db, "Listing Data"));

// Read all Data from Database
async function getAllEntries() {
  const userSnapshot = await getDocs(userQuery);
  userSnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
  });
  
  const textbookSnapshot = await getDocs(textQuery);
  textbookSnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
  });

  const listingSnapshot = await getDocs(listQuery);
  listingSnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
  });
}
