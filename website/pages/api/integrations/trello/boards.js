import User from '../../models/user';
import { connectToDatabase } from '../../helpers/mongo';
import { authenticateUser } from '../../helpers/auth.user';
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

connectToDatabase();


export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {
    const { uid } = authenticateUser(req, res)
    const user = await User.findById(uid);
    const { trelloAccessToken, trelloRefreshToken } = user;

    oauth.getProtectedResource("https://api.trello.com/1/members/me/boards", "GET", trelloAccessToken, trelloRefreshToken, async function (error, data, response) {
        if (error) console.log(error);
        try {
            res.status(200).json(JSON.parse(data).filter(board => !board.closed))
        } catch (e) {
            console.log(e.message);
            res.status(500).json({ result: false, message: e.message });
        }

    });
}