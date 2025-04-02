import { addUser } from './firebaseInterface.js';
import { firebaseConfig } from './hoftapsFirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

import { 
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js"

// All the vars relating to account creation

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const mainView = document.getElementById("main-view");

const signUpContainer = document.querySelector('.signup-container');
const logInContainer = document.querySelector('.login-container');
const userProfileView = document.getElementById('profile-container');
const email_input = document.getElementById('email')

const h700_input = document.getElementById('h700')
const hofstraRegex = /^h?7\d{8}$/i;

const firstname_input = document.getElementById('fname')
const lastname_input = document.getElementById('lname')
const password_input = document.getElementById('password')
const confirmpassword_input = document.getElementById('confirm_password')
const signUpBtn = document.getElementById('signup-btn')

const UIuserEmail = document.getElementById("email");
const logOutBtn = document.getElementById("logout-btn");

const loginEmailInput = document.querySelector(".login-container input[name='email']");
const loginPasswordInput = document.querySelector(".login-container input[name='password']");



onAuthStateChanged(auth, (user) => {

  console.log(user);
   if(user) {
    // Hide signup container, show profile
    signUpContainer.style.display = "none";
    document.querySelector(".login-container").style.display = "none";
    // userProfileView.style.display = "block";
    UIuserEmail.innerHTML = user.email;
  } else {
    signUpContainer.style.display = "none";
    document.querySelector(".login-container").style.display = "block";
    userProfileView.style.display = "none";
  }
  
});

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
            const userCredential =  await createUserWithEmailAndPassword(auth, email_input.value, password_input.value);
            const user = userCredential.user;
            console.log(userCredential)


            console.log(addUser(user.uid, firstname_input.value, lastname_input.value, email_input.value, h700_input.value));

    
            // Send email verification
            await sendEmailVerification(user);
    
            // Display a message to the user
            alert("Verification email sent. Check your inbox.");

            window.location.href = "HTAPHome.html";

    
        } catch(error) {
            console.log(error.code)
        }

   
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

  // log out
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log('User signed out.');
    // Hide profile container and signup container
    // document.getElementById("profile-container").style.display = "none";
  document.querySelector(".signup-container").style.display = "none";
    // Show signup container
  document.querySelector(".login-container").style.display = "block";
    })

    .catch((error) => {
      // Handle errors here
      console.error("Error signing out: ", error);
    });
});


document.getElementById("show-signin-btn").addEventListener("click", () => {


  // Hide signup container
  document.querySelector(".signup-container").style.display = "none";

  // Show login container
  document.querySelector(".login-container").style.display = "block";

});


document.getElementById("show-signup-btn").addEventListener("click", () => {

  // Hide login container
  document.querySelector(".login-container").style.display = "none";
  
  // Show signup container
  document.querySelector(".signup-container").style.display = "block";



});

document.getElementById("login-btn").addEventListener("click", async (e) => {
  e.preventDefault(); // Prevent default form submission behavior

  // Get references to login inputs
  const loginEmailInput = document.querySelector(".login-container input[name='email']");
  const loginPasswordInput = document.querySelector(".login-container input[name='password']");
  const loginErrorMessage = document.getElementById("login-error-message");

  // Retrieve email and password values
  const loginEmail = loginEmailInput.value.trim();
  const loginPassword = loginPasswordInput.value.trim();

  // Clear previous error messages
  loginEmailInput.setCustomValidity("");
  loginPasswordInput.setCustomValidity("");
  loginErrorMessage.textContent = "";

  try {
    // Attempt to log in
    await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    console.log("User logged in successfully");
    window.history.back();
  } catch (error) {
    console.error("Error logging in:", error.code);

    let errorMessage = "Login failed. Please try again.";
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email format.";
        loginEmailInput.setCustomValidity(errorMessage);
        break;
      case "auth/user-not-found":
        errorMessage = "No user found with this email.";
        loginEmailInput.setCustomValidity(errorMessage);
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        loginPasswordInput.setCustomValidity(errorMessage);
        break;
      default:
        errorMessage = "The email or password is invalid";
    } 
    


    // Display the error message
    loginErrorMessage.textContent = errorMessage;

    // Report validation to trigger browser message display
    loginEmailInput.reportValidity();
    loginPasswordInput.reportValidity();
  }
});
