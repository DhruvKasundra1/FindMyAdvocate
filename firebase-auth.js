// ✅ Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    sendEmailVerification, 
    onAuthStateChanged, 
    signOut,
    sendPasswordResetEmail,
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZhGA9fKCY9gzcas3T2VegC-balWk7Qmk",
    authDomain: "findmyadvocate-d0106.firebaseapp.com",
    projectId: "findmyadvocate-d0106",
    storageBucket: "findmyadvocate-d0106.appspot.com",  
    messagingSenderId: "356580706914",
    appId: "1:356580706914:web:800b3de77fa3c0b3c59f3b",
    measurementId: "G-H3YTZQHW1F"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Attach Delete Account Function to Button
document.addEventListener("DOMContentLoaded", function () {
    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", deleteAccount);
    }
});

// ✅ Delete Account Function (Fixed for Google Users)
window.deleteAccount = function() {
    const user = auth.currentUser;
    const checkbox = document.getElementById("confirmCheckbox");
    const input = document.getElementById("deleteInput");

    if (!checkbox.checked) {
        alert("Please check the confirmation checkbox.");
        return;
    }

    if (input.value !== "Delete Account") {
        alert("Please type 'Delete Account' to confirm.");
        return;
    }

    if (!user) {
        alert("No user is currently logged in.");
        return;
    }

    // 🔍 Check if user signed in with Google
    const isGoogleUser = user.providerData.some(provider => provider.providerId === "google.com");

    if (isGoogleUser) {
        // ✅ Reauthenticate Google user
        signInWithPopup(auth, provider)
            .then((result) => {
                result.user.delete()
                    .then(() => {
                        alert("Your account has been successfully deleted.");
                        window.location.href = "newlog.html"; // Redirect to login page
                    })
                    .catch((error) => {
                        alert("Error deleting account: " + error.message);
                    });
            })
            .catch((error) => {
                alert("Google reauthentication failed. Please try again.");
            });

    } else {
        // ✅ Reauthenticate Email/Password user
        const password = prompt("Enter your password to confirm deletion:");
        if (!password) {
            alert("Password is required for security purposes.");
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);

        reauthenticateWithCredential(user, credential)
            .then(() => {
                user.delete()
                    .then(() => {
                        alert("Your account has been successfully deleted.");
                        window.location.href = "newlog.html"; // Redirect to login page
                    })
                    .catch((error) => {
                        alert("Error deleting account: " + error.message);
                    });
            })
            .catch((error) => {
                alert("Reauthentication failed. Please log in again.");
                signOut(auth);
                window.location.href = "newlog.html"; // Redirect to login page for re-authentication
            });
    }
};

// ✅ Sign Up Function (With Email Verification & Strong Password Validation)
window.signUp = function() {
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (!validatePassword(password)) {
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // ✅ Send Email Verification
            sendEmailVerification(user).then(() => {
                alert("Verification email sent! Please check your inbox.");
            });

            alert("Sign Up Successful! Please verify your email before logging in.");
            signOut(auth); // Force logout so user can't access home without verifying
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

// ✅ Login Function (Check Email Verification)
window.login = function() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // 🔍 Check if email is verified
            if (user.emailVerified) {
                alert("Login Successful!");
                window.location.href = "home.html"; // Redirect to home page
            } else {
                alert("Please verify your email before logging in.");
                signOut(auth); // Prevents unverified users from staying logged in
            }
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

// ✅ Google Sign-In (No Email Verification Needed)
window.googleSignIn = function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            alert("Google Sign-In Successful!");
            window.location.href = "home.html"; // Redirect to home page
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

// ✅ Check User Login State & Redirect If Verified
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.emailVerified) {
            console.log("User is logged in and verified:", user);
        } else {
            console.log("User is logged in but not verified.");
        }
    }
});


// ✅ Toggle Forms (Switch between Login & Sign Up)
window.toggleForms = function() {
    document.getElementById("signup-form").style.display = 
        document.getElementById("signup-form").style.display === "none" ? "block" : "none";
    document.getElementById("login-form").style.display = 
        document.getElementById("login-form").style.display === "none" ? "block" : "none";
};

// ✅ Logout Function
window.logout = function () {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully!");
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "newlog.html"; // Redirect to login page
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};

// ✅ Attach Logout Function to Navbar Logout Link
document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            logout();
        });
    }
});

// ✅ Strong Password Validation
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

    if (!passwordRegex.test(password)) {
        alert("Password must be at least 8 characters, contain an uppercase letter, a number, and a special character.");
        return false;
    }
    return true;
}

// ✅ Forgot Password Function
window.forgotPassword = function() {
    const email = document.getElementById("loginEmail").value;

    if (!email) {
        alert("Please enter your email to reset password.");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password reset link sent to your email.");
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
};
