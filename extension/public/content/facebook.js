/* eslint-disable no-undef */
/* eslint-disable no-loop-func */
/*global chrome*/
console.log("Running on Facebook");
const timer = setInterval(run, 2000);

async function run() {

    // If the extension setting is on
    if (!await chrome.storage.local.get('active')) return clearInterval(timer);

    const postContainer = document.querySelector('div[aria-label="Create a post"]');
    if (postContainer && !postContainer.classList.contains('getgame')) {

        const buttonContainer = postContainer.children[1];
        const firstBtn = buttonContainer.firstChild;

        const span = document.createElement('span');
        span.textContent = "AI Post";

        const buttonGetGame = document.createElement('button');
        buttonGetGame.classList.add(...firstBtn.getAttribute("class").split(" "), 'btn-fb-getgame-post');

        const img = document.createElement('img');
        img.src = chrome.runtime.getURL("icons/ai.png");

        buttonGetGame.appendChild(img);
        buttonGetGame.appendChild(span);
        buttonContainer.appendChild(buttonGetGame);


        // Button to create a AI Generated Posts
        buttonGetGame.onclick = () => {

        }

        postContainer.classList.add('getgame')
    }


    const posts = document.querySelectorAll('div[aria-posinset]');
    for (const post of posts) {
        if (!post.classList.contains('getgame') && !post.textContent.toLowerCase().indexOf("Reels and short".toLowerCase()) !== -1) {
            const btnAudio = document.createElement('button');
            const btnDownload = document.createElement('button');

            const imgAudio = document.createElement('img');
            imgAudio.src = chrome.runtime.getURL("icons/audio.png");

            const imgDownload = document.createElement('img');
            imgDownload.src = chrome.runtime.getURL("icons/download.png");

            btnAudio.appendChild(imgAudio);
            btnDownload.appendChild(imgDownload);
            btnAudio.setAttribute("title", "Play Post as Audio");
            btnDownload.setAttribute("title", "Download Post as Audio");

            // Add to post div
            const container = document.createElement('div');
            container.classList.add('getgame-post-audio')
            container.appendChild(btnAudio);
            container.appendChild(btnDownload);
            post.appendChild(container);

            //add class
            post.classList.add('getgame')

            btnAudio.onclick = () => {
                if (post.querySelector('div[dir="auto"]')) {

                    // Get Text from post
                    const text = post.querySelector('div[dir="auto"]').textContent;

                    // Play Audio from ./functions/texttospeech.js
                    speak(text)
                }
            }

            btnDownload.onclick = () => downloadHTML(post)

            // Add UI on like and comment button
            if (post.querySelector('[aria-label="Leave a comment"]')) {
                const container = post.querySelector('[aria-label="Leave a comment"]').parentElement.parentElement;

                const span = document.createElement('span');
                span.textContent = "Read Comment";

                const buttonGetGame = document.createElement('button');
                buttonGetGame.classList.add('btn-fb-getgame-comment');

                const img = document.createElement('img');
                img.src = chrome.runtime.getURL("icons/audio-fb.png");

                buttonGetGame.appendChild(img);
                buttonGetGame.appendChild(span);
                container.appendChild(buttonGetGame);

                buttonGetGame.onclick = () => {
                    const comments = [];
                    const commentBlocks = post.querySelectorAll('[role="article"]')
                    for (const block of commentBlocks) {
                        if (block.querySelector('div[dir="auto"]')) {
                            const text = block.querySelector('div[dir="auto"]').textContent;
                            const image = block.querySelector('image').getAttribute("xlink:href");
                            const name = block.querySelector('a span[dir="auto"]').textContent;
                            if (text) comments.push({ text, image, name })
                        }
                    }

                    console.log('Comments', comments)
                }
            }

        }


        // Add Buttons to comment blocks
        for (const block of post.querySelectorAll('[role="article"]')) {
            const list = block.querySelector('ul');
            if (list && !list.classList.contains('getgame')) {
                const classNames = list.firstChild.getAttribute('class');

                const liRead = document.createElement('li');
                liRead.classList.add(...classNames.split(' '), 'btn-fb-getgame-reply');

                const liDowload = document.createElement('li');
                liDowload.classList.add(...classNames.split(' '), 'btn-fb-getgame-reply');


                // add class
                list.classList.add('getgame');

                liRead.textContent = "Read";
                liDowload.textContent = "Dowload";
                list.appendChild(liRead);
                list.appendChild(liDowload);


                // On Reading that comment
                liRead.onclick = () => {

                }

                // Download comment
                liDowload.onclick = () => downloadHTML(block)
            }
        }

    }


    // Add UI on popup comment dialog
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {

        if (!dialog.classList.contains('getgame')) {
            // Add UI on like and comment button
            if (dialog.querySelector('[aria-label="Leave a comment"]')) {
                const container = dialog.querySelector('[aria-label="Leave a comment"]').parentElement.parentElement;

                const span = document.createElement('span');
                span.textContent = "Read Comment";

                const buttonGetGame = document.createElement('button');
                buttonGetGame.classList.add('btn-fb-getgame-comment');

                const img = document.createElement('img');
                img.src = chrome.runtime.getURL("icons/audio-fb.png");

                buttonGetGame.appendChild(img);
                buttonGetGame.appendChild(span);
                container.appendChild(buttonGetGame);

                dialog.classList.add('getgame');

                buttonGetGame.onclick = () => {
                    const comments = [];
                    const commentBlocks = dialog.querySelectorAll('[role="article"]')
                    for (const block of commentBlocks) {
                        if (block.querySelector('div[dir="auto"]')) {
                            const text = block.querySelector('div[dir="auto"]').textContent;
                            const image = block.querySelector('image').getAttribute("xlink:href");
                            const name = block.querySelector('a span[dir="auto"]').textContent;
                            if (text) comments.push({ text, image, name })
                        }
                    }

                    console.log('Comments', comments)
                }
            }
        }

        // Add Buttons to comment blocks
        for (const block of dialog.querySelectorAll('[role="article"]')) {
            const list = block.querySelector('ul');
            if (list && !list.classList.contains('getgame')) {
                const classNames = list.firstChild.getAttribute('class');
                const liRead = document.createElement('li');
                liRead.classList.add(...classNames.split(' '), 'btn-fb-getgame-reply');

                const liDowload = document.createElement('li');
                liDowload.classList.add(...classNames.split(' '), 'btn-fb-getgame-reply');


                // add class
                list.classList.add('getgame');

                liRead.textContent = "Read";
                liDowload.textContent = "Dowload";
                list.appendChild(liRead);
                list.appendChild(liDowload);


                // On Reading that comment
                liRead.onclick = () => {

                }

                // Download comment
                liDowload.onclick = () => downloadHTML(block)
            }
        }
    }
}