let userSignedIn = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.message) {
        case "is-user-signed-in":
            sendResponse({
                message: 'success',
                payload: userSignedIn
            });
            break;
        case "sign-out":
            userSignedIn = false;
            sendResponse({ message: "success" });
            break;
        case "sign-in":
            userSignedIn = true;
            sendResponse({ message: "success" });
            break;
        case "get-auth-token":
            chrome.identity.getAuthToken({interactive: true}, function(token) {
                sendResponse({
                    message: "success",
                    token: token,
                });
            });
            break;
        default:
            chrome.action.setPopup({popup: "./login.html"}, () => {
                sendResponse({message: "success"});
            });
            break;
    }
    return true;
})