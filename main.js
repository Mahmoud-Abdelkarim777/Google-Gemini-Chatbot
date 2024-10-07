const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");

// API configuration
const YOUR_API_KEY = "AIzaSyDfWk1C74ah8h0jz2ofdFos1Df_dt_dRF0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${YOUR_API_KEY}`;

let userMessage = null;
// Create a new user message element and return it
const CreateMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
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
        const apiRrsponse = data?.candidates[0].content.parts[0].text;
        textElement.innerHTML = apiRrsponse;
    }catch(error){
        console.log(error);
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
            <span class="icon material-symbols-rounded">content_copy</span>
                `;
    const incomingMessageDiv = CreateMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    generatAPIResponse(incomingMessageDiv);
};
// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if (!userMessage)  return; //Exit if there is no message
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
    setTimeout(showLoadingAnimation, 500); // show Loading Animation after delay
}

// prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

