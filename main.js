const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null; // Initializes to store empty value at the beginning.

let isResponseGenerating = false; //  API response is currently being fetched empty

// API configuration
const MY_API_KEY = "AIzaSyDfWk1C74ah8h0jz2ofdFos1Df_dt_dRF0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MY_API_KEY}`;

const loadLocalStorageData = () => {
    const saveChats = localStorage.getItem("saveChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");
    // apply the stored theme color
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerHTML = isLightMode ? "dark_mode" : "light_mode";
    
    // restore saved chats
    chatList.innerHTML = saveChats || "";

    document.body.classList.toggle("hide-header", saveChats);
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom of the chat list
}
loadLocalStorageData();
// Create a new user message element and return it
const CreateMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(" ");
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        // Append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        // Check if all words are displayed
        if(currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide"); // remove the icon
            // save chat  to local storage
            localStorage.setItem("saveChats", chatList.innerHTML);
        }
        chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom of the chat list
    },75);
}

// fetch response from api based on user message
const generatAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text"); // get the text element

    // send a post request to the api with the user's message
    try{
        const response = await fetch(API_URL,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: userMessage }] 
                }]
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        // get the API response text and remove asterisks from it
        const apiRrsponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1");
        // update the text element with the API response
        showTypingEffect(apiRrsponse, textElement, incomingMessageDiv);
    }catch(error){
        isResponseGenerating = false;
        textElement.innerHTML = error.message;
        textElement.classList.add("error");
    }finally{
        incomingMessageDiv.classList.remove("loading"); // hide loading animation after response
    }
};

// show a loading animation while for the api response
const showLoadingAnimation = () =>{
    const html = `
                <div class="message-content">
                <img src="images/gemini.svg" alt="gemini image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick = "copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>
                `;
    const incomingMessageDiv = CreateMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom of the chat list
    generatAPIResponse(incomingMessageDiv);
};
// copy message to clipboard

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText; 
    navigator.clipboard.writeText(messageText);
    copyIcon.innerHTML = "done"; // show tick icon
    setTimeout(() => {
        copyIcon.innerHTML = "content_copy"; // revert back to copy icon
    }, 1000); // show tick icon for 1 second 
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating)  return; //Exit if there is no message

    isResponseGenerating = true; 
    const html = `
                <div class="message-content">
                    <img src="images/user.jpg" alt="user image" class="avatar">
                    <p class="text"></p>
                </div>
                `;
    
    const outgoingMessageDiv = CreateMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // clear input field
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom of the chat list
    document.body.classList.add("hide-header"); // hide header once chat start
    setTimeout(showLoadingAnimation, 500); // show Loading Animation after delay
}

// set userMessage and handle outgoing messages when a suggestion is clicked
suggestions.forEach(suggestion =>{
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});
// toggle between light and dark theme 
toggleThemeButton.addEventListener ("click", () =>{
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerHTML = isLightMode ? "dark_mode" : "light_mode";
});

// delete all chats from the localStorage when button is clicked 
deleteChatButton.addEventListener ("click", () =>{
    if (confirm ( "Are you sure you want to delete all messages")) {
        localStorage.removeItem("saveChats");
        loadLocalStorageData();
    }
});
// prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

