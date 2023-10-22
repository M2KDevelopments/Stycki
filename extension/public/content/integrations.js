/*global chrome*/
/** This looks for the OAUTH Screen for to get the access token from the url */
console.log('Sticky Notes Oauth');
if (window.location.href.match(/stickynotes.*integration/gmi)) {
    chrome.runtime.sendMessage({ cid: "integrations" });
}