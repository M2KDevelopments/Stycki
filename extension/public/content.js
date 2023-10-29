/*global chrome */
/* eslint-disable no-undef */

/**
 * author: Martin Kululanga
 * github: https://github.com/m2kdevelopments
 */

let offsetX = 0, offsetY = 0, isDragging = false, movableDiv = null;

chrome.storage.local.get('active', data => {
    if (!data.active) return;

    // Show shared notes instead
    if (window.location.href.match(/#share=/gmi)) {

        Toastify({
            text: "Loading shared notes",
            duration: 3000,
            destination: "https://stickynotespro.m2kdevelopments.com",
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
        return chrome.runtime.sendMessage({ cid: "shared-notes" })
    }


    // Create start button
    const buttonStart = document.createElement("button");
    buttonStart.classList.add("stickynotespro");

    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("/icons/logo.png");

    const buttonCloseAll = document.createElement("button");
    const buttonMinimizeAll = document.createElement("button");
    buttonCloseAll.classList.add('stickynotespro-close-all')
    buttonMinimizeAll.classList.add('stickynotespro-minimize-all');
    buttonCloseAll.setAttribute('title', 'Close all notes')
    buttonMinimizeAll.setAttribute('title', 'Open Sider for minimized notes');

    // Create Side Bar and Button
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `<div class="stickynotespro-sidebar"></div>`
    dialog.classList.add('stickynotespro-sidebar-dialog');


    // Adding Elements into the screen
    buttonStart.appendChild(img);
    document.body.appendChild(buttonMinimizeAll);
    document.body.appendChild(buttonCloseAll);
    document.body.appendChild(dialog);
    document.body.appendChild(buttonStart);
    showNotesOnSideBar();

    buttonStart.onclick = async () => {
        const id = crypto.randomUUID();
        createNote(id, null);
    }

    buttonCloseAll.onclick = async () => {
        const result = window.confirm('Are you want to remove all notes on this page?');
        if (result) {
            const ids = [];
            for (const div of document.querySelectorAll('.stickynotespro-paper')) {
                const id = div.getAttribute('id');
                ids.push(id);
                div.remove();
            }

            const { notes } = await chrome.storage.local.get('notes');
            const remainingNotes = notes.filter(n => ids.indexOf(n.id) === -1);
            await chrome.storage.local.set({ notes: remainingNotes });
            await showNotesOnSideBar()
            await chrome.runtime.sendMessage({ cid: "delete-many-notes", ids: ids });
        }
    }

    // Toggle Dialog
    buttonMinimizeAll.onclick = () => dialog.open ? dialog.close() : dialog.showModal();

});


// Load notes from this url
chrome.storage.local.get('notes', async (data) => {
    const { active } = await chrome.storage.local.get('active');
    const { notes } = data;
    if (!notes || !active) return;

    const list = notes.filter(note => note.url === window.location.href && !note.minimized);
    for (const note of list) createNote(note.id, note)
})


// Show message
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.cid === "alert") {
        Toastify({
            text: message.message,
            duration: 3000,
            destination: "https://stickynotespro.m2kdevelopments.com",
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
    } else if (message.cid === "shared-notes") {
        for (const note of message.notes) createNote(note.id, note, true)
    }
    sendResponse(true);
    return true;
});

// Function to stop dragging
document.onmouseup = async function () {
    isDragging = false;
    if (movableDiv) {

        const x = parseInt(movableDiv.style.left.replace("px", ''))
        const y = parseInt(movableDiv.style.top.replace("px", ''))

        // Save to storage
        const { notes } = await chrome.storage.local.get('notes');
        const index = notes.findIndex(n => n.id === movableDiv.getAttribute('id'));
        notes[index].x = x;
        notes[index].y = y;
        await chrome.storage.local.set({ notes: notes });
        await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });

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

async function createNote(id, defaultNote = null, disabled = false) {
    let { notes } = await chrome.storage.local.get('notes');
    if (!notes) notes = [];

    const { count } = await chrome.storage.local.get('count');
    if (count <= notes.length) return alert("You've exceeded your note limit. Purchase a plan do get more note space");


    const x = defaultNote ? defaultNote.x : 100;
    const y = defaultNote ? defaultNote.y : 40;
    const minimized = defaultNote ? defaultNote.minimized : false;
    const text = defaultNote ? defaultNote.text : "";


    const div = document.createElement("div");
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.classList.add("stickynotespro-paper");
    div.setAttribute("id", id);

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

    const color = defaultNote ? defaultNote.color : colors[parseInt(Math.random() * colors.length)]
    const title = defaultNote ? defaultNote.name : "New Note"

    div.innerHTML = disabled ? `
    <section style="background:${color}">
        <div class="appbar">
            <p id="name-${id}" title="${title}">${title}</p>
            <nav>
                <input disabled type="color" value="${color}" title="Sticky Note Color"/>
                <button disabled title="Minimize"></button>
                <button disabled title="Maximize"></button>
                <button disabled title="Close"></button>
            </nav>
        </div>
        <article>
            <textarea disabled>${text}</textarea>
        </article>
    </section>
    `
        : `
    <section style="background:${color}">
        <div class="appbar">
            <p id="name-${id}" title="Double click to rename note">${title}</p>
            <nav>
                <input type="color" value="${color}" title="Sticky Note Color"/>
                <button title="Minimize"></button>
                <button title="Maximize"></button>
                <button title="Close"></button>
            </nav>
        </div>
        <article>
            <textarea>${text}</textarea>
        </article>
    </section>
    `

    // create a note in storage
    if (!defaultNote) {
        const note = {
            id,
            name: title,
            url: window.location.href,
            webname: document.title,
            text: "",
            color: color,
            minimized: minimized,
            x: x,
            y: y
        };
        notes.push(note);
        chrome.storage.local.set({ notes: notes });
        chrome.runtime.sendMessage({ cid: "add-note", note });
    }


    // Add to DOM
    document.body.appendChild(div);

    if (!disabled) {


        div.querySelector('textarea').onchange = async (e) => {
            const { notes } = await chrome.storage.local.get('notes');
            const index = notes.findIndex(n => id === n.id);
            notes[index].text = e.target.value;
            await chrome.storage.local.set({ notes: notes });
            await showNotesOnSideBar();
            await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });
        }

        // Button functions
        div.querySelector('button[title="Minimize"]').onclick = async () => {
            const { notes } = await chrome.storage.local.get('notes');
            const index = notes.findIndex(n => id === n.id);
            notes[index].minimized = true;
            await chrome.storage.local.set({ notes: notes });
            div.remove();
            await showNotesOnSideBar();
            await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });
        }

        div.querySelector('button[title="Maximize"]').onclick = () => {

        }


        div.querySelector('button[title="Close"]').onclick = async () => {
            const result = window.confirm('Are you sure you want to delete this note?')
            if (result) {
                const { notes } = await chrome.storage.local.get('notes');
                const remainingNotes = notes.filter(n => id !== n.id);
                await chrome.storage.local.set({ notes: remainingNotes });
                div.remove();

                const index = notes.findIndex(n => id === n.id);
                await chrome.runtime.sendMessage({ cid: "delete-note", note: notes[index] });
            }
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
        div.querySelector('input[type="color"]').onchange = async (e) => {
            div.querySelector('section').style.background = e.target.value;
            const { notes } = await chrome.storage.local.get('notes');
            const index = notes.findIndex(n => n.id === id);
            notes[index].color = e.target.value;
            chrome.storage.local.set({ notes: notes });
            await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });
        }

        // Rename Note
        div.querySelector('p').ondblclick = async (e) => {
            const { notes } = await chrome.storage.local.get('notes');
            const index = notes.findIndex(n => n.id === id);
            const name = window.prompt('Rename Note', div.querySelector('p').textContent);
            if (name) {
                div.querySelector('p').textContent = name;
                div.querySelector('p').setAttribute('title', `Double click to rename note: ${name}`);
                notes[index].name = name;
                chrome.storage.local.set({ notes: notes });
                await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });
            }
        }
    }
}

async function showNotesOnSideBar() {
    let { notes } = await chrome.storage.local.get('notes');
    if (!notes) notes = [];
    const sidebar = document.querySelector('.stickynotespro-sidebar');

    // Remove all
    for (const div of sidebar.children) div.remove();

    for (const note of notes.filter(note => note.minimized && note.url === window.location.href)) {
        const { id, name, color, text } = note;

        const div = document.createElement("div");
        div.classList.add("stickynotespro-paper");
        div.setAttribute("id", id);
        div.style.position = 'static';
        div.innerHTML = `
        <section style="background:${color}">
            <div class="appbar">
                <p id="name-${id}" title="Double click to rename note">${name}</p>
                <nav>
                    <input type="color" value="${color}" title="Sticky Note Color"/>
                    <button disabled title="Minimize (Disabled)"></button>
                    <button title="Maximize"></button>
                    <button title="Close"></button>
                </nav>
            </div>
            <article>
                <textarea>${text}</textarea>
            </article>
        </section>
        `
        sidebar.appendChild(div);

        div.querySelector('button[title="Maximize"]').onclick = async () => {
            const { notes } = await chrome.storage.local.get('notes');
            const index = notes.findIndex(n => id === n.id);
            notes[index].minimized = false;
            await chrome.storage.local.set({ notes: notes });
            div.remove();
            await showNotesOnSideBar();
            await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });
            createNote(notes[index].id, notes[index]);
        }

        div.querySelector('button[title="Close"]').onclick = async () => {
            const result = window.confirm('Are you sure you want to delete this note?')
            if (result) {
                const { notes } = await chrome.storage.local.get('notes');
                const remainingNotes = notes.filter(n => id !== n.id);
                await chrome.storage.local.set({ notes: remainingNotes });
                div.remove();
                await chrome.runtime.sendMessage({ cid: "delete-note", note: notes[index] });
            }
        }

        div.querySelector('textarea').onchange = async (e) => {
            const { notes } = await chrome.storage.local.get('notes');
            const index = notes.findIndex(n => id === n.id);
            notes[index].text = e.target.value;
            await chrome.storage.local.set({ notes: notes });
            await showNotesOnSideBar();
            await chrome.runtime.sendMessage({ cid: "update-note", note: notes[index] });
        }
    }

    // close button
    const closeButton = document.createElement('button');
    closeButton.textContent = "X";
    closeButton.classList.add('close-button');
    closeButton.onclick = () => document.querySelector('.stickynotespro-sidebar-dialog').close();

    // Search Bar
    const searchTexxArea = document.createElement('input');
    searchTexxArea.setAttribute('type', 'search');
    searchTexxArea.setAttribute('placeholder', 'Search...');
    searchTexxArea.onchange = (e) => {
        const text = e.target.value + e.key;
        const list = notes.filter(note => note.minimized && note.url === window.location.href)

        if (text.replace(/\s/gmi, '') === '') {
            for (const note of list) document.getElementById(note.id).style.display = 'block';
            return;
        }

        const filtered = list.filter(note => !(note.name.toLowerCase().indexOf(text.toLowerCase()) !== -1 || note.text.toLowerCase().indexOf(text.toLowerCase()) !== -1))
        for (const note of filtered) document.getElementById(note.id).style.display = 'none';
    }

    sidebar.prepend(searchTexxArea);
    sidebar.append(closeButton);
}