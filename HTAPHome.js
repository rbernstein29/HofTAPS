import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getUser } from './firebaseInterface.js';
import { purchaseBook } from "./purchaseTextbook.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to shuffle an array using the Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Async function to fetch textbooks from Firestore and update the carousel images
async function populateTextbookCarousel() {
  const textbookCollectionRef = collection(db, 'Textbook Data');

  // Get image and link elements
  const carouselImg1 = document.getElementById('carousel-img-1');
  const carouselImg2 = document.getElementById('carousel-img-2');
  const carouselImg3 = document.getElementById('carousel-img-3');
  const link1 = document.getElementById('link-1');
  const link2 = document.getElementById('link-2');
  const link3 = document.getElementById('link-3');
  const carouselElement = document.getElementById('carouselExampleIndicators');

  if (!carouselImg1 || !carouselImg2 || !carouselImg3 || !link1 || !link2 || !link3 || !carouselElement) {
    console.error("Carousel image or link elements not found!");
    return;
  }

  try {
    console.log("Fetching textbooks from Firestore...");
    const querySnapshot = await getDocs(textbookCollectionRef);
    const listings = [];

    // Collect listing objects that contain both id and thumbnail
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Adjust based on your document structure
      if (data.thumbnail) {
        listings.push({
          id: doc.id,
          thumbnail: data.thumbnail,
          // Include any other fields you need for the listing here
          ...data
        });
      } else {
        console.warn(`Document ${doc.id} is missing a thumbnail URL.`);
      }
    });

    console.log(`Found ${listings.length} textbooks with thumbnails.`);
    if (listings.length < 3) {
      console.warn("Not enough textbooks with thumbnails found to populate the carousel (need at least 3).");
      carouselElement.style.display = 'none';
      return;
    }

    // Shuffle and select three random listings
    shuffleArray(listings);
    const randomListings = listings.slice(0, 3);
    console.log("Selected listings:", randomListings);

    // Update the carousel images and attach click events for dynamic navigation
    // Listing 1
    carouselImg1.src = randomListings[0].thumbnail;
    carouselImg1.alt = "Random Textbook 1";
    link1.href = "indListing.html"; // This can be a fallback
    link1.onclick = (e) => {
      e.preventDefault(); // Prevent the default navigation
      localStorage.indListing = JSON.stringify(randomListings[0]);
      window.location.href = "indListing.html";
    };

    // Listing 2
    carouselImg2.src = randomListings[1].thumbnail;
    carouselImg2.alt = "Random Textbook 2";
    link2.href = "indListing.html";
    link2.onclick = (e) => {
      e.preventDefault();
      localStorage.indListing = JSON.stringify(randomListings[1]);
      window.location.href = "indListing.html";
    };

    // Listing 3
    carouselImg3.src = randomListings[2].thumbnail;
    carouselImg3.alt = "Random Textbook 3";
    link3.href = "indListing.html";
    link3.onclick = (e) => {
      e.preventDefault();
      localStorage.indListing = JSON.stringify(randomListings[2]);
      window.location.href = "indListing.html";
    };

    console.log("Carousel populated successfully.");
  } catch (error) {
    console.error("Error fetching textbooks or populating carousel:", error);
    carouselElement.style.display = 'none';
  }
}

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', populateTextbookCarousel);

