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

let authToken = null;

window.onload = function() {
    allowSignOut();
}

function allowSignOut() {
    document.getElementById("sign-out").addEventListener("click", () => {
        // Sign out with firebase
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // Sign out
                firebase.auth().signOut().then(function() {
                    window.user = {};
                    window.location.replace("./login.html")
                }).catch(function(error) {
                    alert("Sorry something went wrong");
                });
            } 
        });
    
    });
}
