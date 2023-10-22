import { OAuth } from 'oauth';
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';
import { authenticateUserByToken } from '../../helpers/auth.user';
import User from '../../models/user';
import url from 'url';
/*
   OAuth Setup and Functions
*/
const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";
const appName = "Sticky Notes Pro";
const scope = 'read';
const expiration = '1hour';

// Be sure to include your key and secret in 🗝.env ↖️ over there.
// You can get your key and secret from Trello at: https://trello.com/app-key
const key = process.env.TRELLO_KEY;
const secret = process.env.TRELLO_OAUTH_SECRET;

// Trello redirects the user here after authentication
const redirectUri = `https://stickynotespro.m2kdevelopments.com/api/integrations/trello/callback`;

const oauth = new OAuth(requestURL, accessURL, key, secret, "1.0A", redirectUri, "HMAC-SHA1")


export default async function handler(req, res) {
    try {
        const query = url.parse(req.url, true).query;
        const token = query.oauth_token;
        const tokenSecret = getCookie(token, { req, res });
        const userToken = getCookie('user', { req, res });
        const { uid } = authenticateUserByToken(userToken)
        const verifier = query.oauth_verifier;
        oauth.getOAuthAccessToken(token, tokenSecret, verifier, function (error, accessToken, accessTokenSecret, results) {

            if (error) {
                console.log(error.message);
                return res.status(200).redirect('/integrations/failed')
            }

            // In a real app, the accessToken and accessTokenSecret should be stored
            oauth.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, async function (error, data, response) {
                deleteCookie(token, { req, res });
                deleteCookie('user', { req, res });
                if (uid) {
                    const user = await User.findById(uid);
                    if (user) {
                        user.trelloAccessToken = accessToken;
                        user.trelloRefreshToken = accessTokenSecret;
                        await user.save();
                        console.log('Save Trello Integration')
                    } else console.log('User not found', uid)
                } else console.log('No User Id Provided');
                res.status(200).redirect('/integrations/success')
            });
        });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}