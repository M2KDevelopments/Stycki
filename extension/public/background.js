/* eslint-disable no-undef */
/**
 * author: Martin Kululanga
 * github: https://github.com/m2kdevelopments
 */
const headers = {
  'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
  'Content-Type': 'application/json; charset=utf-8',
};

const FIREBASE_SENDER_ID = "297012997658";

// Add Message Campaigns
const responses = [
  { emotion: "Happy", name: "🙂 Happy" },
  { emotion: "Sad", name: "😢 Sad" },
  { emotion: "Angry", name: "😠 Angry" },
  { emotion: "Excited", name: "😄 Excited" },
  { emotion: "Calm", name: "😌 Calm" },
  { emotion: "Firtly", name: "😍 Firtly" }
];

chrome.runtime.onInstalled.addListener(async function (details) {

  const INSTALL = "install", UPDATE = "update", CHROME_UPDATE = "chrome_update", SHARED_UPDATE = "shared_module_update";

  if (details.reason === INSTALL) chrome.tabs.create({ url: "https://www.m2kdevelopments.com/apps/getgame/installed" })

  if (details.reason === INSTALL || details.reason === UPDATE || details.reason === CHROME_UPDATE || details.reason === SHARED_UPDATE) {
    // Initialize Firebase Notifications
    initFirebaseNotifications('https://getgame.onrender.com');
    countNotifications();
    chrome.runtime.setUninstallURL(`https://www.m2kdevelopments.com/apps/getgame/uninstalled`);
  }

  // Create Context Menu
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      title: 'Get Game',
      contexts: ['selection'],
      id: "main"
    }, () => {

      chrome.contextMenus.create({
        title: `🗣️ Read Out`,
        contexts: ['selection'],
        id: 'read',
        parentId: "main"
      });

      chrome.contextMenus.create({
        title: `Replies`,
        contexts: ['selection'],
        id: 'reply',
        parentId: "main"
      }, () => {

        for (const msg of responses) {
          chrome.contextMenus.create({
            title: msg.name,
            contexts: ['selection'],
            id: msg.emotion,
            parentId: "reply"
          })
        }
      });
    });
  });
});

//add listener for push notification to this service worker
this.onpush = (e) => {
  e.preventDefault();
  e.waitUntil(console.log(e.data.json()))
};

//Chrome firebase
chrome.gcm.onMessage.addListener((message) => {
  const { data } = message;
  const { content } = data;
  const json = JSON.parse(content);
  const { payload, body, id, title, bigPicture, largeIcon } = json;
  const { from, button1, button2, url } = payload;

  // Setup Buttons
  const buttons = []
  if (button1) buttons.push({ title: button1.title, url: button1.url })
  if (button2) buttons.push({ title: button2.title, url: button1.url });

  // Showing the Notifications
  if (bigPicture) {
    const notification = {
      title,
      message: body,
      contextMessage: `From ${from}`,
      iconUrl: largeIcon ? largeIcon : 'logo192.png',
      buttons: buttons.map(button => {
        return { title: button.title }
      }),
      imageUrl: bigPicture,
      type: "image"
    }
    chrome.notifications.create(id, notification);
    notification.url = url;
    notification.buttons = buttons
    addNotification(notification)
  } else {
    const notification = {
      title,
      message: body,
      contextMessage: `From ${from}`,
      iconUrl: largeIcon ? largeIcon : 'logo192.png',
      buttons: buttons,
      type: "basic"
    }
    chrome.notifications.create(id, notification);
    notification.url = url;
    addNotification(notification)

  }

  // Listeners for Events
  const buttonListener = (notificationId, buttonIndex) => {
    if (notificationId === id) {
      if (buttonIndex === 0 && button1.url) chrome.tabs.create({ url: button1.url })
      if (buttonIndex === 1 && button2.url) chrome.tabs.create({ url: button2.url })
    }
  }

  const notificationListener = (notificationId) => {
    if (notificationId === id && url) chrome.tabs.create({ url: url })
  }

  chrome.notifications.onButtonClicked.addListener(buttonListener)

  chrome.notifications.onClicked.addListener(notificationListener)

  chrome.notifications.onClosed.addListener((notificationId) => {
    if (notificationId === id) {
      chrome.notifications.onClicked.removeListener(notificationListener);
      chrome.notifications.onButtonClicked.removeListener(buttonListener);
    }
  })
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const id = info.menuItemId;
  const { selectionText } = info;

  const response = responses.find(response => response.emotion === id);
  if (response) {

    const prompt = `I need a ${response.emotion} response for this message "${selectionText}". Just tell the response do not confirm that you understand.`;

    const url = `https://getgame.onrender.com`;
    const { user } = await chrome.storage.local.get('user');

    if (!user) chrome.tabs.sendMessage(tab.id, { cid: "alert", message: "You need to login in first" });

    const access_token = user ? user : "";
    const body = {
      prompt,
      messages: []
    }

    headers['Authorization'] = `Bearer ${access_token}`;
    const res = await fetch(`${url}/api/openai`, { method: 'POST', headers: headers, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.result) chrome.tabs.sendMessage(tab.id, { cid: "context-openai", message: json.message })
    else chrome.tabs.sendMessage(tab.id, { cid: "alert", message: "Sorry could get the response" });
  } else if (id === "read") await speak(selectionText)
});


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

  // New Model - https://dev.to/luckey/how-to-upgrade-text-davinci-003-to-gpt-35-turbo-2b6e#:~:text=Conclusion,to%20use%20the%20new%20model.
  if (message.cid === "openai") {
    const url = `https://getgame.onrender.com`;
    const { user } = await chrome.storage.local.get('user');

    if (!user) chrome.tabs.sendMessage(sender.tab.id, { cid: "alert", message: "You need to login in first" });

    const access_token = user ? user : "";
    const body = {
      prompt: message.prompt,
      messages: message.messages
    }

    headers['Authorization'] = `Bearer ${access_token}`;
    const res = await fetch(`${url}/api/openai`, { method: 'POST', headers: headers, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.result) chrome.tabs.sendMessage(sender.tab.id, { cid: "openai", message: json.message })
    else chrome.tabs.sendMessage(sender.tab.id, { cid: "alert", message: "Sorry could get the response" });
  }
  else if (message.cid === "tts") speak(message.message)
  else if (message.cid === "screenshot") chrome.tabs.sendMessage(sender.tab.id, { cid: "screenshot", image: await chrome.tabs.captureVisibleTab({}), ...message });

  sendResponse(true);
  return true;
});

async function initFirebaseNotifications(url) {

  const headers = {
    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    'Content-Type': 'application/json; charset=utf-8',
  }

  const chromeuser = await chrome.identity.getProfileUserInfo();
  const data = await chrome.storage.local.get('notificationId')


  chrome.gcm.register([FIREBASE_SENDER_ID], async (id) => {
    try {
      const body = JSON.stringify({
        gcm: id,
        notificationId: data.notificationId ? data.notificationId : "",
        platform: "chrome",
        ...chromeuser
      });

      //post to register for web push notification on the backend
      const responseWebpush = await fetch(`${url}/api/notifications`, { method: 'post', headers: headers, body: body });
      const json = await responseWebpush.json();

      //save notification in chrome storage
      chrome.storage.local.set({ 'notificationId': json.id }, () => console.log("Notification Setup"));
    } catch (e) {
      console.log(e.message);
    }
  })
}

async function addNotification(notification) {

  //get the notifications
  let { notifications } = await chrome.storage.local.get('notifications')
  if (!notifications) notifications = [];
  notification.date = Date.now();

  // push to array of notifications
  notifications.push(notification);

  // save to local storage
  await chrome.storage.local.set({ notifications });
  await countNotifications();

}

async function countNotifications() {

  let { notifications } = await chrome.storage.local.get('notifications')
  if (!notifications) notifications = [];
  const unread = notifications.filter(n => !n.read).length;

  //update badges
  if (!unread) {
    chrome.action.setBadgeText({ text: '' });
  } else {
    chrome.action.setBadgeText({ text: `${unread}` });
    chrome.action.setBadgeBackgroundColor({ color: "#FFD700" });
  }
}

async function speak(text) {
  // Settings
  const { rate } = await chrome.storage.local.get('rate');
  const { voiceName } = await chrome.storage.local.get('voiceName');


  chrome.tts.speak(
    text,
    {
      'lang': 'en-US',
      'rate': rate ? rate : 1.0,
      'voiceName': voiceName ? voiceName : "",
      onEvent: function (event) {
        console.log('Event ' + event.type + ' at position ' + event.charIndex);
        if (event.type === 'start') console.log('start: ' + event.errorMessage);
        if (event.type === 'end') console.log('end: ' + event.errorMessage);
        if (event.type === 'word') console.log('word: ' + event.errorMessage);
        if (event.type === 'sentence') console.log('sentence: ' + event.errorMessage);
        if (event.type === 'marker') console.log('marker: ' + event.errorMessage);
        if (event.type === 'interrupted') console.log('interrupted: ' + event.errorMessage);
        if (event.type === 'cancelled') console.log('cancelled: ' + event.errorMessage);
        if (event.type === 'error') console.log('Error: ' + event.errorMessage);
        if (event.type === 'pause') console.log('pause: ' + event.errorMessage);
        if (event.type === 'resume') console.log('resume: ' + event.errorMessage);
      }
    },
    function (utterance) {

    }
  );
}