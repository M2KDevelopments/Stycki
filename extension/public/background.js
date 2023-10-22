/* eslint-disable no-undef */
/**
 * author: Martin Kululanga
 * github: https://github.com/m2kdevelopments
 */

const FIREBASE_SENDER_ID = "780886334097";

chrome.runtime.onInstalled.addListener(async function (details) {

  const INSTALL = "install", UPDATE = "update", CHROME_UPDATE = "chrome_update", SHARED_UPDATE = "shared_module_update";

  if (details.reason === INSTALL) chrome.tabs.create({ url: "https://stickynotespro.m2kdevelopments.com/installed" })

  if (details.reason === INSTALL || details.reason === UPDATE || details.reason === CHROME_UPDATE || details.reason === SHARED_UPDATE) {
    // Initialize Firebase Notifications
    initFirebaseNotifications('https://stickynotespro.m2kdevelopments.com');
    countNotifications();
    chrome.runtime.setUninstallURL(`https://stickynotespro.m2kdevelopments.com/uninstalled`);
  }

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


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

  const token = await getAccessToken();
  const url = 'https://stickynotespro.m2kdevelopments.com';
  const headers = {
    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${token}`,
    'authorization': `Bearer ${token}`
  }
  if (message.cid === "add-note") {
    const res = await fetch(`${url}/api/notes`, { method: 'post', headers: headers, body: JSON.stringify(message.note) });
    const json = await res.json();
    chrome.tabs.sendMessage(sender.tab.id, { cid: "alert", ...json })
  } else if (message.cid === "update-note") {
    const res = await fetch(`${url}/api/notes${message.note.id}`, { method: 'patch', headers: headers, body: JSON.stringify(message.note) });
    const json = await res.json();
    console.log(json);
    //chrome.tabs.sendMessage(sender.tab.id, { cid: "alert", ...json })
  } else if (message.cid === "delete-note") {
    const res = await fetch(`${url}/api/notes/${message.note.id}`, { method: 'delete', headers: headers });
    const json = await res.json();
    chrome.tabs.sendMessage(sender.tab.id, { cid: "alert", ...json })
  }else if (message.cid === "delete-many-notes") {
    const res = await fetch(`${url}/api/notes/delete`, { method: 'put', headers: headers, body: JSON.stringify(message.ids)});
    const json = await res.json();
    chrome.tabs.sendMessage(sender.tab.id, { cid: "alert", ...json })
  }
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

function getAccessToken() {
  return new Promise(resolve => chrome.storage.local.get('user', (data) => resolve(data?.user || "")));
}