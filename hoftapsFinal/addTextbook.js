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


const IMGUR_CLIENT_ID = "4e6cd2817e63b3f"; 

export async function uploadToImgur(file, retries = 2) {
    if (!file) return ""; 
    
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            return result.data.link;
        } else {
            throw new Error(result.data.error || "Imgur upload failed");
        }
    } catch (err) {
        if (retries > 0) {
            console.warn(`Retrying upload... (${retries} left)`);
            await new Promise(res => setTimeout(res, 1000));
            return uploadToImgur(file, retries - 1);
        } else {
            console.error("Image upload failed:", err);
            return ""; 
        }
    }
}

const isbnButtonPressed = async (e) => {
    e.preventDefault();

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${text_isbn.value}`);
    const data = await response.json(); 

    if (!data.items || text_isbn.value == "") {
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

    if (validPrice && validCondition && validSubject) {
        try {
            const [frontCoverUrl, backCoverUrl, spineUrl] = await Promise.all([
                uploadToImgur(front_cover_img.files[0]),
                uploadToImgur(back_cover_img.files[0]),
                uploadToImgur(spine_img.files[0])
            ]);
            
            var text_seller = "";
            const ref = query(collection(db, "User Data"), where("email", "==", auth.currentUser.email));
            const docSnap = await getDocs(ref);
            
            const snap = docSnap.docs[0];
            if (snap) {
                text_seller = snap.data();
            }

            // Adds the textbook with the user entered information to the textbook section in Firebase
            const docRef = await addDoc(collection(db, "Textbook Data"), {
                title: text_title,
                author: text_author,
                isbn_number: text_isbn.value,
                subject: text_subject.value,
                price: Number(text_price.value),
                condition: text_condition.value,
                description: text_description.value,
                front_cover: frontCoverUrl,
                back_cover: backCoverUrl,
                spine: spineUrl,
                thumbnail: text_thumbnail,
                seller: text_seller,
            });

            // Adds the textbook above to the user's listings in Firebase
            onAuthStateChanged(auth, (user) => {
                getUser(user.email)
                .then((result) => {
                    const addListing = async () => {
                        try {
                            await updateDoc(result, {
                                listings: arrayUnion(docRef)
                            });
                            alert("Listing added successfully!");
                        } catch (error) {
                            console.error("Error updating user listings:", error);
                        }
                    }
                    addListing();
                    window.location.href = "account.html";
                 })
            });
        } catch (error) {
            console.error("Error uploading listing: ", error);
        }
    }
}

isbnButton.addEventListener("click", isbnButtonPressed);