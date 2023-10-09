/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/*global chrome*/
console.log("Running on Youtube");
const timer = setInterval(run, 3000);

async function run() {

    // If the extension setting is on
    if (!await chrome.storage.local.get('active')) return clearInterval(timer);

    const comments = document.querySelectorAll('ytd-comment-renderer');
    for (const comment of comments) {
        const buttonContainer = comment.querySelector('ytd-comment-action-buttons-renderer')
        if (buttonContainer && !buttonContainer.classList.contains('getgame')) {
            
            const liRead = document.createElement('button');
            liRead.classList.add('btn-yt-getgame');

            const liDowload = document.createElement('button');
            liDowload.classList.add('btn-yt-getgame');

            liRead.textContent = "Read";
            liDowload.textContent = "Dowload";
            buttonContainer.appendChild(liRead);
            buttonContainer.appendChild(liDowload);

            buttonContainer.classList.add('getgame')

            // On Reading that comment
            liRead.onclick = () => {

            }

            // Download comment
            liDowload.onclick = () => {

            }
        }
    }

}