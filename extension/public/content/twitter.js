/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/* global chrome */

console.log("Running on Twitter");
setInterval(run, 2000);


async function run() {

    // If the extension setting is on
    if (!await chrome.storage.local.get('active')) return;

    
    const postContainer = document.querySelector('div[data-testid="toolBar"]');
    if (postContainer) {
        const container = postContainer.firstChild;

        const buttonGetGame = document.createElement('button');
        buttonGetGame.classList.add('btn-fb-getgame-post');

        const img = document.createElement('img');
        img.src = chrome.runtime.getURL("icons/logo.png");

        buttonGetGame.appendChild(img);
        container.appendChild(buttonGetGame);

        // Button to create a AI Generated Posts
        buttonGetGame.onclick = () => {

        }

        clearInterval(intervalTime);
    }


    const posts = document.querySelectorAll('article');
    for (const post of posts) {
        if (!post.classList.contains('.getgame')) {
            const btnAudio = document.createElement('button');
            const btnDownload = document.createElement('button');

            const imgAudio = document.createElement('img');
            imgAudio.src = chrome.runtime.getURL("icons/audio.png");

            const imgDownload = document.createElement('img');
            imgDownload.src = chrome.runtime.getURL("icons/download.png");

            btnAudio.appendChild(imgAudio);
            btnDownload.appendChild(imgDownload);
            btnAudio.setAttribute("title", "Download Post as Audio");

            // Add to post div
            const container = document.createElement('div');
            container.classList.add('getgame-post-audio')
            container.appendChild(btnAudio);
            container.appendChild(btnDownload);
            post.appendChild(container);

            //add class
            post.classList.add('getgame')


            btnAudio.onclick = () => {

            }

            btnDownload.onclick = () => {

            }
        }
    }
}