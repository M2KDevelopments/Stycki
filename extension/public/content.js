/* eslint-disable no-undef */

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

    // New Model - https://dev.to/luckey/how-to-upgrade-text-davinci-003-to-gpt-35-turbo-2b6e#:~:text=Conclusion,to%20use%20the%20new%20model.
    if (message.cid === "alert") {
        Toastify({
            text: message.message,
            duration: 3000,
            destination: "https://m2kdevelopments.com/getgame",
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            onClick: function () { } // Callback after click
        }).showToast();
    } else if (message.cid === "context-openai") {
        await window.navigator.clipboard.writeText(message.message)
        Toastify({
            text: "Response Has been copied to clipboard",
            duration: 6000,
            destination: "https://m2kdevelopments.com/getgame",
            newWindow: true,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            onClick: function () { } // Callback after click
        }).showToast();

        
    }

    sendResponse(true);
    return true;
});