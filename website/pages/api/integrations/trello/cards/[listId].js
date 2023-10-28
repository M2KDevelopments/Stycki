import User from '../../../models/user';
import { connectToDatabase } from '../../../helpers/mongo';
import { authenticateUser } from '../../../helpers/auth.user';
import { OAuth } from 'oauth';
import Note from '../../../models/note';


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

connectToDatabase();


export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else if (req.method.toUpperCase() === 'POST') await post(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {
    const { uid } = authenticateUser(req, res)
    const user = await User.findById(uid);
    const data = await apiCall(user, `https://api.trello.com/1/lists/${req.query.listId}/cards`, "GET");
    return res.status(200).json(data)
}

async function post(req, res) {

    const { uid } = authenticateUser(req, res)
    const user = await User.findById(uid);
    const { ids } = req.body;
    const idList = req.query.listId;
    const notes = await Note.find({ id: { $in: ids }, user: uid });
    
    // Create Cards
    for (const note of notes) {
        const urlSource = encodeURIComponent(note.url);
        const name = encodeURIComponent(note.name);
        const desc = encodeURIComponent(note.text);
        const response = await apiCall(user, `https://api.trello.com/1/cards?idList=${idList}&name=${name}&desc=${desc}&urlSource=${urlSource}`, "POST");
        note.trellocardId = response.id;
        await note.save();
    }

    return res.status(200).json({ result: true, message: `Synced Notes with Trello` })
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