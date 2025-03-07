// Import the functions you need from the SDKs you need
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { collection, doc, addDoc, getDoc, getDocs, deleteDoc, query } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
//console.log(app);


// Create User Entry in Database
export async function addUser(f_name, l_name, mail, h_num, psswrd) {
  await addDoc(collection(db, "User Data"), {
    first_name: f_name,     // users first name
    last_name: l_name,      // users last name
    email: mail,            // users email
    h_number: h_num,        // users id number
    password: psswrd        // users password
  });
}

// Create Textbook Entry in Database 
async function addTextbook(text_title, text_author, text_isbn, text_edition, text_subject) {
  await addDoc(collection(db, "Textbook Data"), {
    title: text_title,      // textbook title
    author: text_author,    // textbook author
    isbn_number: text_isbn, // textbook isbn number
    edition: text_edition,  // textbook edition
    subject: text_subject   // textbook subject
  });
}

// Create Listing Entry in Database 
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

// Delete Data from Database
async function deleteEntry(dataType, toDelete) {
  const docRef = doc(db, dataType, toDelete);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await deleteDoc(docRef);
    console.log("DOCUMENT SUCCESSFULLY DELETED");
  } else {
    console.log("DOCUMENT NOT FOUND");
  }
}

// Read Entry from Database
async function getEntry(dataType, toGet) {
  const docRef = doc(db, dataType, toGet);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log(docSnap.id, " => ", docSnap.data());
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
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
  });
  
  const textbookSnapshot = await getDocs(textQuery);
  textbookSnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
  });

  const listingSnapshot = await getDocs(listQuery);
  listingSnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
  });
}

//setUserData("John", "Smith", "jsmith@pride.hofstra.edu", "700000000", "password");
//setTextbookData("Math Book", "John Smith", "123456789", "1st", "Math");
//setListingData("Math Book", "John Smith", "123456789", "1st", "Math", "New", "$50", "This is a math book");
//deleteData("Listing Data", "listing1");
//deleteData("User Data", "user1");
//getData("Listing Data", "listing1");
getAllEntries();
