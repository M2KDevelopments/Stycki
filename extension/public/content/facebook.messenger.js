/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/*global chrome*/

console.log(`😁 Get Game`);
let obs = null;

const t = setInterval(() => {
    const textarea = document.querySelector('[contenteditable="true"]')
    if (textarea) {
        chrome.storage.local.get('active', (data) => {
            if (data.active) {
                run(textarea);
                setupPopup();
                clearInterval(t);
            }
        })
    }
}, 100);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.cid === "openai") {

        // Person's Name
        const mainLink = document.querySelector('[role="main"] a');
        const name = mainLink ? mainLink.getAttribute("aria-label") : "😁 😁";
        const first_name = name.split(" ")[0] ? name.split(" ")[0] : name;
        const last_name = name.split(" ")[1] ? name.split(" ")[1] : name;

        const contenteditable = document.querySelector('[contenteditable="true"]')
        contenteditable.focus();
        contenteditable.focus();
        const msg = message.message
            .replace(/\[FullName\]/gmi, name)
            .replace(/\[FirstName\]/gmi, first_name)
            .replace(/\[LastName\]/gmi, last_name)

        document.execCommand('insertText', false, msg);
    }

    sendResponse(true);
    return true;
});


async function run(textarea) {

    if (document.querySelector('.getgame-message-campaign-button')) return false;

    // Observer changes
    if (!obs) {
        obs = new MutationObserver((list) => {
            const contenteditable = document.querySelector('[contenteditable="true"]')
            if (contenteditable) run(contenteditable)
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL("icons/logo.png");
    const div = document.createElement('div');
    div.classList.add("getgame-message-campaign-button");
    div.appendChild(img);
    const container = textarea.parentElement.parentElement.parentElement.parentElement;
    container.insertBefore(div, container.firstChild)

    // getgame-hide
    div.onclick = () => {
        const popup = document.querySelector(".getgame-message-campaign-popup");
        if (popup) {
            if (popup.classList.contains('getgame-hide')) popup.classList.remove('getgame-hide')
            else popup.classList.add('getgame-hide')
        }
    }

}

async function setupPopup() {

    // Add Popup
    const popup = document.createElement("div");
    const section = document.createElement("section");
    const h1 = document.createElement("h1");
    h1.textContent = "Get Game Responses"
    popup.classList.add("getgame-message-campaign-popup");
    popup.classList.add("getgame-hide");
    popup.appendChild(h1)
    popup.appendChild(section);

    // Person's Name
    const mainLink = document.querySelector('[role="main"] a');
    const name = mainLink ? mainLink.getAttribute("aria-label") : "😁 😁";

    // Add Message Campaigns
    const responses = [
        { emotion: "Custom", name: "✍️ Custom" },
        { emotion: "Happy", name: "🙂 Happy" },
        { emotion: "Sad", name: "😢 Sad" },
        { emotion: "Angry", name: "😠 Angry" },
        { emotion: "Excited", name: "😄 Excited" },
        { emotion: "Calm", name: "😌 Calm" },
        { emotion: "Firtly", name: "😍 Firtly" }
    ]

    for (const campaign of responses) {
        const button = document.createElement('button');
        button.innerText = campaign.name;

        button.onclick = () => {

            //get conversation
            const messages = [];
            const conversation = document.querySelectorAll('[data-scope="messages_table"]');
            for (const div of conversation) {
                if (div.querySelector('div[dir="auto"]')) {
                    const message = div.querySelector('div[dir="auto"]').textContent;
                    const images = div.querySelectorAll('img');
                    
                    let you = false;
                    if (images.length) for (const img of images) {
                        if (!img.getAttribute('alt')) {
                            you = true;
                            break;
                        }
                    } else you = true;

                    messages.push({ message, me: you });
                }
            }

            console.log(messages)


            let reply = '';
            let error = '';
            let customPrompt = "";

            if (campaign.emotion !== "Custom") {
                // Validations
                if (!messages.filter(m => !m.me).length) error = "No messages to reply to"
                else if (messages[messages.length - 1].me) {
                    const result = window.confirm(`You message is the last one do you want to reply to the ${name}'s last message?`);
                    const othermessages = messages.filter(m => !m.me)
                    if (result) {
                        reply = othermessages[othermessages.length - 1].message;
                    } else error = 'Cancelled';
                }

                // Get Last Reply
                if (!error) reply = messages[messages.length - 1];

            } else {
                customPrompt = window.prompt('Prompt Get Game to send what kind of response');
                error = 'Custom Message Cancelled'
                if (!customPrompt) return Toastify({
                    text: error,
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
            }

            const prompt = customPrompt ? customPrompt : `I need a ${campaign.emotion} response, using [FirstName], [LastName] and [FullName] as placeholders. for this message "${reply}". Just tell the response do not confirm that you understand.`

            if (!reply) {
                Toastify({
                    text: error,
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
            } else chrome.runtime.sendMessage({ cid: "openai", prompt, messages });
        }

        section.appendChild(button);
    }

    document.body.appendChild(popup);

}