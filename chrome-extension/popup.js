const firebaseConfig = {
    apiKey: "AIzaSyCDBO1NWURhFlBZpd1Bxc2pxUPhV8k8LMQ",
    authDomain: "hey-addy-chatgpt.firebaseapp.com",
    projectId: "hey-addy-chatgpt",
    storageBucket: "hey-addy-chatgpt.appspot.com",
    messagingSenderId: "284266859441",
    appId: "1:284266859441:web:1253e79ad223c0e7410b90",
    measurementId: "G-B10H5SHQ5C"
};
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const loginButton = document.getElementById("login-btn");
const signUpButton = document.getElementById("sign-up-btn");


// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());

const uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            chrome.runtime.sendMessage({ message: 'sign-in' }, function (response) {
                window.user = authResult.user;
                if (response.message === 'success') {
                    window.location.replace('./main.html');
                }
            });
            return false;
        },
    },
    signInFlow: 'popup',
    signInOptions: [
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        },
    ],
    // tosUrl: '<your-tos-url>',
    // privacyPolicyUrl: '<your-privacy-policy-url>'
};

// If user, show main content
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.user = user;
        window.location.replace('./main.html');
    } else {
        // Show login
        // const signInDiv = document.getElementById("sign-in-options");
        // const spinner = document.getElementById("login-loading");

        // if (signInDiv) signInDiv.style.display = "block";
        // if (spinner) spinner.style.display = "none";

        ui.start('#sign-in-options', uiConfig);
    }
});


document.addEventListener('DOMContentLoaded', (event) => {
    
});