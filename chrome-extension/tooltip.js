let authToken = null;
let clickedSentiment = null;
let globalThread = null;
let globalSentiment = null;
let API_URL = "http://localhost:5001/hey-addy-chatgpt/us-central1/api";

window.onload = async function() {
    getAuthToken() // Get gmail auth token
    main(); // Loads the tooltip bar
}

const sentiments = [
    {
        tone: "friendly",
        html: "&#128522"
    },
    {
        tone: "respectful",
        html: "&#127913"
    },
    {
        tone: "formal",
        html: "&#128084"
    },
    {
        tone: "informal",
        html: "&#128085"
    },
    {
        tone: "funny",
        html: "&#128513"
    },
    {
        tone: "excited",
        html: "&#129321"
    },
    {
        tone: "interested",
        html: "&#128077"
    },
    {
        tone: "not interested",
        html: "&#128558"
    },
    {
        tone: "thankful",
        html: "&#128588"
    },
    {
        tone: "angry",
        html: "&#128545"
    },
    {
        tone: "surprised",
        html: "&#128558",
    }
];


function getAuthToken() {
    // Get auth token from background.js
    chrome.runtime.sendMessage({ message: "get-auth-token" }, function (response) {
        if (response.message && response.message == "success") {
            authToken = response.token;
        }
    });
}

function stringSentenceCase(str) {
    return str.replace(/\.\s+([a-z])[^\.]|^(\s*[a-z])[^\.]/g, s => s.replace(/([a-z])/,s => s.toUpperCase()))
}

function main() {
    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };
    const selector = '.editable[aria-label="Message Body"]';
    const settings = {}
    observeRecursively(targetNode, config, selector, settings);
    
}

function observeRecursively(targetNode, config, selector, settings) {
    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        let toolTipAdded = false;
        if (addedNodes(mutationsList)) {
            toolTipAdded = addTooltipToElements(selector, settings, observer);
        }
    
        observer.disconnect();
        
        // If the overlay tooltip wasn't added, observe DOM again for
        // changes
        if (!toolTipAdded) {
            observeRecursively(targetNode, config, selector, settings);
        }
    };
  
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
  
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}

// Check if new nodes have been added to the dom
function addedNodes(mutations) {
    let hasUpdates = false;
  
    for (let index = 0; index < mutations.length; index++) {
      const mutation = mutations[index];
  
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        hasUpdates = true;
        break;
      }
    }
  
    return hasUpdates;
}

// Add the overlay box to the Messagebox element
function addTooltipToElements(selector, settings, observer) {
    let messageBox = document.querySelector(selector);
    if (messageBox !== null) {
        // Get parent div 2 nodes up. First node does not have ID
        // to select
        const parentDiv = messageBox.parentNode.parentNode;
        const parentID = parentDiv.id;

        const parent = document.getElementById(parentID);
        const toolTipDiv = document.createElement("div");
        // Configure ToolTipDiv
        configureToolTipDiv(toolTipDiv);
        // Create the Sentiment Elements
        createSentimentElementsInTooltip(sentiments, toolTipDiv);

        // Add Tooltip to view
        parent.prepend(
            toolTipDiv
        )
        findEmailThread();
        return true;
    } else {
        // alert("no message box");
        return false;
    }
}

async function findEmailThread() {
    const legacyThreadElement = document.querySelector('[data-legacy-thread-id]');
    if (!legacyThreadElement || legacyThreadElement == null
        || legacyThreadElement == undefined) {
        // TODO: Send a message that legacy thread data not found
    }

    const threadID = legacyThreadElement.getAttribute('data-legacy-thread-id');
    let thread = await fetchThread(threadID);
    // For every thread, get the message, build thread.
    // add relevant data.
    thread = filterThread(thread);
    globalThread = thread;
}

function filterThread(thread) {
    // Raw thread contains a bunch of unnecessary stuff,
    // Filter, message, sender, receiver, subject
    const messages = thread.messages;
    if (messages == undefined || !messages.length ||
        messages.length == undefined || messages.length < 1) {
        throw new Error("NoMessagesInThread");
    }
    // Iterate through messages
    const newThread = {
        messages: [],
        subject: "",
    };

    const filteredMessages = [];

    for (let i = 0; i < messages.length; i++) {
        const email = messages[i];
        // If no email payload skip this email
        if (email.payload == undefined) continue;
        const msg = {}
        const headers = email.payload.headers;
        let text = email.payload.parts[0].body.data;
        // Conver text from base 64 to plain
    
        // Iterate throught headers and find From, To, Subject
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            const value = header.value;
            if (header.name == "From") {
                const sender = value.includes("<") ?
                    value.split("<")[0].trim() : value;
                msg["sender"] = sender;
            } else if (header.name == "To") {
                const receiver = value.includes("<") ?
                    value.split("<")[0].trim() : value;
                msg["receiver"] = receiver;
            } else if (header.name == "Subject") {
                if (newThread.subject.length < 1) {
                    newThread.subject = value;
                }
            } else {
                continue; // skip
            }
        }

        // Combine everything
        msg["text"] = text;
        filteredMessages.push(msg);
    }
    newThread.messages = filteredMessages;
    return newThread;
}

async function fetchThread(threadID) {
    // Check if we have an auth token
    if (authToken == null) throw new Error("AuthTokenIsNull");
    const config = {
        method: 'GET',
        async: true,
        headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        'contentType': 'json'
    };

    let dataReceived = {};
    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadID}`, config)
        .then((response) => response.json())
        .then((data) => {
            dataReceived = data;
        }).catch((error) => {
            throw error;
        })
    return dataReceived;
}

async function fetchSuggestion(requestData, endpoint) {
    // TODO: Throttle requests by adding identity or user headers
    const data = requestData;
    let suggestion = {};
    await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            // Successful response
            console.log(data);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    return suggestion;
}



function configureToolTipDiv(toolTipDiv) {
    toolTipDiv.className = "hey-addy-tooltip";
    toolTipDiv.style.display = "flex";
    toolTipDiv.style.flexWrap = "wrap";
    toolTipDiv.style.flexDirection = "row";
    toolTipDiv.style.paddingTop = "6px";
    toolTipDiv.style.paddingBottom = "10px";
    toolTipDiv.style.width = "100%"; 
}

function createSentimentElementsInTooltip(sentiments, toolTip) {
    for (let i = 0; i < sentiments.length; i++) {
        if(i > 4) continue;
        let sentiment = sentiments[i] // Full object with attributes
        const sentimentElement = document.createElement("div");
        sentimentElement.classList.add("sentiment-button");
        const HTMLValue = sentiment.html +
            "&nbsp;"+
            stringSentenceCase(sentiment.tone);
        sentimentElement.innerHTML = HTMLValue;
        const sentimentID = "hey-addy-sentiment-" + i.toString();
        sentimentElement.setAttribute("id", sentimentID);
        sentimentElement.style = {};
        // Add styles
        addUnclickedStylesForSentimentButton(sentimentElement);

        // Add mouse over and leave behavior
        setSentimentMouseHoverBehavior(sentimentElement);
        setSentimentMouseOutBehavior(sentimentElement);

        // Add a listener to the sentiment element
        addSentimentOnClickListener(sentimentElement, sentiment);
        
        toolTip.append(sentimentElement); // Add sentiment
    }

    // Create  the write button
    createWriteButtonInTooltip(toolTip);
}

function createWriteButtonInTooltip(toolTip) {
    const writeButton = document.createElement("div");
    writeButton.innerHTML = "Write email";
    writeButton.setAttribute("id", "hey-addy-write-button");
    writeButton.style = {};
    // Add styles
    addUnClickedStylesForWriteButton(writeButton);

    // Add mouse over and leave behavior
    setWriteButtonMouseHoverBehavior(writeButton);
    setWriteButtonMouseOutBehavior(writeButton);

    // Add a listener to the sentiment element
    addWriteButtonOnClickListener(writeButton, {});
    toolTip.append(writeButton);
    
}

// Onclick listener for write button
async function addWriteButtonOnClickListener(writeButton) {
    writeButton.addEventListener("click", async () => {
       // Update styles
       addClickedStylesForWriteButton(writeButton);
        // Make request
        if (globalSentiment == null && globalThread == null) {
            // TODO: Show user an error
            return;
        }
        const requestData = {
            thread: globalThread,
            sentiment: globalSentiment,
        }
        // Fetch suggestion
        const suggestion = await fetchSuggestion(
            requestData,
            `${API_URL}/thread/response`
        )
        console.log("suggestion ", suggestion);

        
    });
}

function setWriteButtonMouseHoverBehavior(writeButton) {
    writeButton.addEventListener('mouseover', () => {
        
        addClickedStylesForWriteButton(writeButton)
    });
}

function setWriteButtonMouseOutBehavior(writeButton) {
    writeButton.addEventListener('mouseleave', () => {
        
        addUnClickedStylesForWriteButton(writeButton)
    });
}

function addSentimentOnClickListener(sentimentButton, sentiment) {
    sentimentButton.addEventListener("click", () => {
        // Get previously clicked sentiment if any, remove styles
        if (clickedSentiment !== null) {
            clickedSentiment.classList.remove("sentiment-clicked");
            addUnclickedStylesForSentimentButton(clickedSentiment);
        }
        // Update the styles of this sentiment
        sentimentButton.classList.add("sentiment-clicked");
        addClickedStylesForSentimentButton(sentimentButton);
    
        // Update the global state of which element has been clicked
        clickedSentiment = sentimentButton;
        globalSentiment = sentiment;
    });
}

function setSentimentMouseHoverBehavior(sentimentButton) {
    sentimentButton.addEventListener('mouseover', () => {
        // If this is the clicked element do nothing, else configure
        if (clickedSentiment == null) return;

        if (sentimentButton.id !== clickedSentiment.id) {
            addClickedStylesForSentimentButton(sentimentButton)
        }
    });
}

function setSentimentMouseOutBehavior(sentimentButton) {
    sentimentButton.addEventListener('mouseleave', () => {
        // If this is the clicked element do nothing, else configure
        if (clickedSentiment == null) return;

        if (sentimentButton.id !== clickedSentiment.id) {
            addUnclickedStylesForSentimentButton(sentimentButton)
        }
    });
}

function addUnclickedStylesForSentimentButton(sentimentButton) {
    sentimentButton.style.border = "1px solid rgba(111, 112, 112, 0.5)";
    sentimentButton.style.paddingLeft = "10px";
    sentimentButton.style.paddingRight = "10px";
    sentimentButton.style.paddingTop = "2px";
    sentimentButton.style.marginBottom = "8px";
    sentimentButton.style.paddingBottom = "3px";
    sentimentButton.style.borderRadius = "7px";
    sentimentButton.style.fontSize = "15px";
    sentimentButton.style.color = "#282828";
    sentimentButton.style.fontFamily = "Helvetica, sans-serif";
    sentimentButton.style.marginRight = "11px";
    sentimentButton.style.display = "flex";
    sentimentButton.style.flexDirection = "row";
    sentimentButton.style.justifyContent = "center";
    sentimentButton.style.alignItems = "center";
    sentimentButton.style.backgroundColor = "transparent";
    sentimentButton.style.cursor = "pointer";

}
function addClickedStylesForSentimentButton(sentimentButton) {
    sentimentButton.style.color = "#165BD1";
    sentimentButton.style.backgroundColor = "rgba(116, 152, 225, 0.2)";
    sentimentButton.style.border = "1px solid rgba(116, 152, 225, 0.3)";
    sentimentButton.style.transition = "0.3s all ease";
    sentimentButton.style.cursor = "pointer";
}

function addClickedStylesForWriteButton(writeButton, action) {
    // action can be one of "hover" or "click"
    // writeButton.style.boxShadow = "0 4px 7px 0 rgba(152, 160, 180, 10)"
    writeButton.style.boxShadow = "0 1px 6px 2px rgba(137, 167, 230, 1)"
    // writeButton.style.background = "linear-gradient(to right, #E040FB, #00BCD4)";
    writeButton.style.transition = "0.3s all ease";
    writeButton.style.cursor = "pointer";

    if (action == "click") {
        // After x time. set back to unclicked state
    }

}

function addUnClickedStylesForWriteButton(writeButton) {
    writeButton.style.boxShadow = "none"
    writeButton.style.marginBottom = "8px";
    writeButton.style.border = "transparent";
    writeButton.style.paddingLeft = "10px";
    writeButton.style.paddingRight = "10px";
    writeButton.style.paddingTop = "2px";
    writeButton.style.paddingBottom = "3px";
    writeButton.style.borderRadius = "7px";
    writeButton.style.fontSize = "15px";
    writeButton.style.color = "rgba(255, 255, 225, 0.9)";
    writeButton.style.fontFamily = "Helvetica, sans-serif";
    writeButton.style.marginRight = "11px";
    writeButton.style.display = "flex";
    writeButton.style.flexDirection = "row";
    writeButton.style.justifyContent = "center";
    writeButton.style.alignItems = "center";
    writeButton.style.background = "#0A57D0";
}
