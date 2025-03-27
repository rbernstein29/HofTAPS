// Import from Firebase SDK
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { collection, addDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js"; 
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getUser } from './firebaseInterface.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Elements from HTAPSell.html which are entered by the user
const text_title = document.getElementById('title');
const text_author = document.getElementById('author');
const text_isbn = document.getElementById('isbn');
const text_subject = document.getElementById('subject');
const text_price = document.getElementById('price');
const text_condition = document.getElementById('condition');
const text_description = document.getElementById('description');
const front_cover_img = document.getElementById('frontCover');
const back_cover_img = document.getElementById('backCover');
const spine_img = document.getElementById('spine');
// Publish button element
const publishButton = document.getElementById('publishButton');

// Detects when the publish button is pressed and executes publishing
const publishButtonPressed = async (e) => {
    e.preventDefault();

    // Certain information must be entered by the user
    // Requires the user to enter an ISBN number
    if (!text_isbn.value) {
        text_isbn.setCustomValidity("Please enter a valid ISBN number.");
        text_isbn.reportValidity();
    }
    // Requires the user to enter a textbook title
    if (!text_title.value) {
        text_title.setCustomValidity("Please enter the textbook's title");
        text_title.reportValidity();
    }
    // Requires the user to enter a textbook author
    if (!text_author.value) {
        text_author.setCustomValidity("Please enter the textbook's author.");
        text_author.reportValidity();
    }
    // Requires the user to enter a price for the textbook
    if (!text_price.value) {
        text_price.setCustomValidity("Please enter a price");
        text_price.reportValidity();
    }

    // Fetches the thumbnail image of the textbook from the Google Books API
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${text_isbn.value}`);
    const data = await response.json();
   
    // Checks if the ISBN was found in the Google Books API
    // If not, the thumbnail is set to the front cover image uploaded by the user, which may be empty
    var text_thumbnail = ""
    if (data.items) { text_thumbnail = data.items[0].volumeInfo.imageLinks.thumbnail } 
    else {text_thumbnail = front_cover_img.value}

    // Adds the textbook with the user entered information to the textbook section in Firebase
    const docRef = await addDoc(collection(db, "Textbook Data"), {
        title: text_title.value,                                                        // textbook title
        author: text_author.value,                                                      // textbook author
        isbn_number: text_isbn.value,                                                   // textbook isbn number
        subject: text_subject.value,                                                    // textbook subject
        price: text_price.value,                                                        // textbook price
        condition: text_condition.value,                                                // textbook condition
        description: text_description.value,                                            // textbook description
        front_cover: front_cover_img.value,                                             // textbook front cover picture
        back_cover: back_cover_img.value,                                               // textbook back cover picture
        spine: spine_img.value,                                                         // textbook spine picture
        thumbnail: text_thumbnail,                                                      // textbook thumbnail
        seller: auth.currentUser.email,                                                 // textbook seller
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
        })
    });
    
}

publishButton.addEventListener("click", publishButtonPressed);

