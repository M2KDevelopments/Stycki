/*global chrome*/
/** This looks for the OAUTH Screen for to get the access token from the url */
console.log('Sticky Notes Oauth');
if (window.location.href.match(/stickynotes.*oauth/gmi)) {
    const access_token = document.querySelector(".access_token").textContent;
    chrome.runtime.sendMessage({ cid: "oauth", access_token });
}