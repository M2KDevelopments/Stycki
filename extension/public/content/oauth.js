/*global chrome*/
/** This looks for the OAUTH Screen for to get the access token from the url */
console.log('Sticky Notes OAuth');
if (window.location.href.match(/token/gmi)) {

    const access_token = window.location.href.replace(/.*token=/gmi, '')
    if(access_token) chrome.runtime.sendMessage({ cid: "oauth", access_token });
}