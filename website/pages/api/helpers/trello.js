import { OAuth } from 'oauth';

/*
   OAuth Setup and Functions
*/
const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";

// Be sure to include your key and secret in 🗝.env ↖️ over there.
// You can get your key and secret from Trello at: https://trello.com/app-key
const key = process.env.TRELLO_KEY;
const secret = process.env.TRELLO_OAUTH_SECRET;

// Trello redirects the user here after authentication
const redirectUri = `https://stickynotespro.m2kdevelopments.com/api/integrations/trello/callback`;

const oauth = new OAuth(requestURL, accessURL, key, secret, "1.0A", redirectUri, "HMAC-SHA1")


export async function updateTrelloNotes(user, note) {

    const name = note.name;
    const desc = note.text;
    const urlSource = note.url;
    const cardId = note.trellocardId;
    return await apiCall(user, `https://api.trello.com/1/cards/${cardId}?name=${name}&desc=${desc}&urlSource=${urlSource}`, "PUT");
}

function apiCall(user, url, method) {
    return new Promise((resolve, reject) => {
        const { trelloAccessToken, trelloRefreshToken } = user;
        oauth.getProtectedResource(url, method, trelloAccessToken, trelloRefreshToken, async function (error, data, response) {
            if (error) reject(error);
            resolve(JSON.parse(data));
        });
    });
}