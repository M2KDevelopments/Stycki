/*global chrome */
/**
 * author: Martin Kululanga
 * github: https://github.com/m2kdevelopments
 */

let offsetX = 0, offsetY = 0, isDragging = false, movableDiv = null;

// Create start button
const button = document.createElement("button");
button.classList.add("stickynotespro");

const img = document.createElement("img");
img.src = chrome.runtime.getURL("/icons/logo.png");

const buttonCloseAll = document.createElement("button");
const buttonMinimizeAll = document.createElement("button");
buttonCloseAll.classList.add('stickynotespro-close-all')
buttonMinimizeAll.classList.add('stickynotespro-minimize-all')
buttonCloseAll.setAttribute('title', 'Close all notes')
buttonMinimizeAll.setAttribute('title', 'Minimize all notes')

button.appendChild(img);
document.body.appendChild(button);
document.body.appendChild(buttonMinimizeAll);
document.body.appendChild(buttonCloseAll);


button.onclick = () => {
    const div = document.createElement("div");
    div.style.left = `100px`;
    div.style.top = `40px`;
    div.classList.add("stickynotespro-paper");

    const colors = [
        "#f5f599",
        "#f5f599",
        "#f5f599",
        "#E4F2FF",
        "#E4F2FF",
        "#E4F2FF",
        "#96e9cc",
        "#96e9cc",
        "#96e9cc",
        "#e9af96",
        "#e99696",
        "#e9af96",
        "#e99696",
        "#e996dd",
        "#9699e9",
        "#f5f599",
        "#f5f599",
    ]

    const color = colors[parseInt(Math.random() * colors.length)]

    div.innerHTML = `
    <section style="background:${color}">
        <div class="appbar">
            <p title="Double click to rename note">Title</p>
            <nav>
                <input type="color" value="${color}" title="Sticky Note Color"/>
                <button title="Minimize"></button>
                <button title="Maximize"></button>
                <button title="Close"></button>
            </nav>
        </div>
        <article>
            <textarea></textarea>
        </article>
    </section>
    `

    // Add to DOM
    document.body.appendChild(div);

    // Button functions
    div.querySelector('button[title="Minimize"]').onclick = () => {

    }

    div.querySelector('button[title="Maximize"]').onclick = () => {

    }

    div.querySelector('button[title="Close"]').onclick = () => {
        const result = window.confirm('Are you sure you want to delete this note?')
        if (result) div.remove();
    }

    // Function to start dragging
    div.querySelector('.appbar').onmousedown = (e) => {
        movableDiv = div;
        div.querySelector('.appbar').style.cursor = 'grabbing'
        isDragging = true;
        offsetX = e.clientX - movableDiv.getBoundingClientRect().left;
        offsetY = e.clientY - movableDiv.getBoundingClientRect().top;
    }

    // Change Color
    div.querySelector('input[type="color"]').onchange = (e) => {
        div.querySelector('section').style.background = e.target.value;
    }

    // Rename Note
    div.querySelector('p').ondblclick = (e) => {
        const name = window.prompt('Rename Note', div.querySelector('p').textContent);
        if (name) {
            div.querySelector('p').textContent = name;
            div.querySelector('p').setAttribute('title', `Double click to rename note: ${name}`);
        }
    }
}

buttonCloseAll.onclick = () => {
    const result = window.confirm('Are you want to remove all notes from this page?');
    if (result) {
        for (const div of document.querySelectorAll('.stickynotespro-paper')) div.remove();
    }
}

buttonMinimizeAll.onclick = () => {
    
}


// Function to stop dragging
document.onmouseup = function () {
    isDragging = false;
    if (movableDiv) {
        movableDiv.querySelector('.appbar').style.cursor = 'grab';
        movableDiv = null;
    }
};

// Function to move the div
document.onmousemove = function (e) {
    if (!isDragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    // Ensure the div stays within the boundaries of the viewport
    let maxX = window.innerWidth - movableDiv.offsetWidth;
    let maxY = window.innerHeight - movableDiv.offsetHeight;

    x = Math.min(maxX, Math.max(0, x));
    y = Math.min(maxY, Math.max(0, y));

    movableDiv.style.left = x + 'px';
    movableDiv.style.top = y + 'px';
};