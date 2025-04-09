// Import from Firebase SDK
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { collection, addDoc, updateDoc, arrayUnion, query, where, getDocs} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getUser } from './firebaseInterface.js';
import { authUser } from './authUser.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

authUser(); // Checks if user is signed in

// Elements from HTAPSell.html which are entered by the user
const text_isbn = document.getElementById('isbn');
const text_subject = document.getElementById('subject');
const text_price = document.getElementById('price');
const text_condition = document.getElementById('condition');
const text_description = document.getElementById('description');
const front_cover_img = document.getElementById('frontCover');
const back_cover_img = document.getElementById('backCover');
const spine_img = document.getElementById('spine');
var text_title = "";
var text_author = "";
var text_thumbnail = "";

const isbnButton = document.getElementById('isbnButton');
const publishButton = document.getElementById('publishButton');

const userBook = document.getElementById('userBook');

const isbnButtonPressed = async (e) => {
    e.preventDefault();

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${text_isbn.value}`);
    const data = await response.json(); 

    // Certain information must be entered by the user
    // Requires the user to enter an ISBN number
    if (!data.items) {
        text_isbn.setCustomValidity("Please enter a valid ISBN number.");
        text_isbn.reportValidity();
    }
    else {
        text_title = data.items[0].volumeInfo.title;
        if (data.items[0].volumeInfo.authors) { text_author = data.items[0].volumeInfo.authors.toString(); }
        else { text_author = "Unknown Author"; }
        if (data.items[0].volumeInfo.imageLinks) { text_thumbnail = data.items[0].volumeInfo.imageLinks.thumbnail; }
        else { text_thumbnail = "";}

        userBook.innerHTML = ""; // Clear previous book information

        const bookImage = document.createElement('img');
        bookImage.src = text_thumbnail;

        const bookTitle = document.createElement('div');
        bookTitle.textContent = text_title;

        const bookAuthor = document.createElement('div');
        bookAuthor.textContent = text_author;

        const bookISBN = document.createElement('div');

        bookISBN.textContent = text_isbn.value;
        userBook.appendChild(bookImage);
        userBook.appendChild(bookTitle);
        userBook.appendChild(bookAuthor);
        userBook.appendChild(bookISBN);
    }

    publishButton.addEventListener("click", publishButtonPressed);

}

// Detects when the publish button is pressed and executes publishing
const publishButtonPressed = async (e) => {
    e.preventDefault();

    var validPrice = false;
    var validCondition = false;
    var validSubject = false;

    // Requires the user to enter a price for the textbook
    if (!text_price.value) {
        text_price.setCustomValidity("Please enter a price");
        text_price.reportValidity();
    } else { validPrice = true; }

    if (text_condition.value == "Select Book Condition") {
        text_condition.setCustomValidity("Please select a condition");
        text_condition.reportValidity();
    } else { validCondition = true; }

    if (text_subject.value == "Choose Subject") {
        text_subject.setCustomValidity("Please select a subject");
        text_subject.reportValidity();
    } else { validSubject = true; }

    var text_seller = "";
    const docRef = query(collection(db, "User Data"), where("email", "==", auth.currentUser.email));   // Gets user with matching email
    const docSnap = await getDocs(docRef);
    
    const snap = docSnap.docs[0];     // There should only be one result - each email is unique
    if (snap) {
        text_seller = snap.data();
    }

    if (validPrice && validCondition && validSubject) {
        // Adds the textbook with the user entered information to the textbook section in Firebase
        const docRef = await addDoc(collection(db, "Textbook Data"), {
            title: text_title,                                                              // textbook title
            author: text_author,                                                            // textbook author
            isbn_number: text_isbn.value,                                                   // textbook isbn number
            subject: text_subject.value,                                                    // textbook subject
            price: Number(text_price.value),                                                // textbook price
            condition: text_condition.value,                                                // textbook condition
            description: text_description.value,                                            // textbook description
            front_cover: front_cover_img.value,                                             // textbook front cover picture
            back_cover: back_cover_img.value,                                               // textbook back cover picture
            spine: spine_img.value,                                                         // textbook spine picture
            thumbnail: text_thumbnail,                                                      // textbook thumbnail
            seller: text_seller,                                                            // textbook seller
        });

        // Adds the textbook above to the user's listings in Firebase
        onAuthStateChanged(auth, (user) => {
            getUser(user.email)
            .then((result) => {
                const addListing = async () => {
                    try {
                        // Adds new listing to user's listings
                        await updateDoc(result, {
                            listings: arrayUnion(docRef)
                        });
                    } catch (error) {
                        console.error("Error updating user listings:", error);
                    }
                }
            addListing();
            window.location.href = "account.html";
            })
        });
    
    }
}

isbnButton.addEventListener("click", isbnButtonPressed);


