import { addUser } from '../firebaseInterface.js';
import { firebaseConfig } from '../hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

import { 
    getAuth,
    createUserWithEmailAndPassword,
    
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"

// All the vars relating to account creation

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById('form')
const email_input = document.getElementById('email')

const h700_input = document.getElementById('h700')
const hofstraRegex = /^h?7\d{8}$/i;

const firstname_input = document.getElementById('fname')
const lastname_input = document.getElementById('lname')
const password_input = document.getElementById('password')
const confirmpassword_input = document.getElementById('confirm_password')
const signUpBtn = document.getElementById('signup-btn')

const signUpButtonPressed = async (e) => {
    e.preventDefault();


    // Validate Hofstra 700 number
    if (!hofstraRegex.test(h700_input.value)) {
        h700_input.setCustomValidity("Please enter a valid 9-digit Hofstra ID number starting with 7.");
        h700_input.reportValidity();
        return; // Stop the function if H700 number is invalid
    } else {
        h700_input.setCustomValidity("");
    }

    // check if password is at least 8 letters
    if (password_input.value.length < 8) {
        password_input.setCustomValidity("Password must be at least 8 characters long");
        password_input.reportValidity();
        return; // Stop function if password isn't at least 8 characters long
      } else {
        password_input.setCustomValidity("");
      }


        // Check if the password fields match
    if (password_input.value !== confirmpassword_input.value) {
        // Option 1: Use setCustomValidity to show a built-in validation error
        confirmpassword_input.setCustomValidity("Passwords do not match");
        confirmpassword_input.reportValidity();
        return; // Stop the function execution
    } else {
        // Clear any previous custom validity message
        confirmpassword_input.setCustomValidity("");
    }

  
    try {
        const userCredential =  await createUserWithEmailAndPassword(auth, email.value, password.value);
        console.log(userCredential)
    } catch(error) {
        console.log(error.code)
    }


   addUser(firstname_input.value, lastname_input.value, email_input.value, h700_input.value);
};


signUpBtn.addEventListener("click", signUpButtonPressed);

h700_input.addEventListener("input", () => {
    if (hofstraRegex.test(h700_input.value)) {
      h700_input.setCustomValidity("");
    }
  });
  

confirmpassword_input.addEventListener("input", () => {
    if (password_input.value === confirmpassword_input.value) {
      confirmpassword_input.setCustomValidity("");
    }
  });

