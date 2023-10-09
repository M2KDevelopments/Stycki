

/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/*global chrome*/
console.log("Running on Linekedin")
setInterval(run, 2000);

async function run() {

    // If the extension setting is on
    if (!await chrome.storage.local.get('active')) return;


    const posts = document.querySelectorAll('[data-id]');
    for (const post of posts) {
        if (!post.classList.contains('getgame')) {
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

            const actionBar = post.querySelector('.feed-shared-social-actions');

            if (actionBar) {
                const buttonReadComments = document.createElement('button');
                buttonReadComments.classList.add('btn-ln-getgame-comment');

                const span = document.createElement('span');
                span.textContent = "Read"

                const img = document.createElement('img');
                img.src = chrome.runtime.getURL("icons/audio-ln.png");

                buttonReadComments.appendChild(img);
                buttonReadComments.appendChild(span);
                actionBar.appendChild(buttonReadComments);

                buttonReadComments.onclick = () => {

                }

            }

            //add class
            post.classList.add('getgame')


            btnAudio.onclick = () => {
                const span = post.querySelector('span[dir="ltr"]');
                const content = post.querySelector('.feed-shared-inline-show-more-text');
                if (content) {
                    const name = span.textContent.trim();
                    const text = content.textContent.trim();

                    // Play Audio from ./functions/texttospeech.js
                    //speak(text)
                    console.log(name, 'says', text);
                }
            }

            btnDownload.onclick = () => {

            }
        }

    }
}