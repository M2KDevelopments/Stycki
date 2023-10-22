import { OAuth } from 'oauth';
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';
/*
   OAuth Setup and Functions
*/
const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";
const appName = "Sticky Notes Pro";
const scope = 'read,write';
const expiration = '30days';//'1hour';

const dev = process.env.NODE_ENV !== 'production';


// Be sure to include your key and secret in 🗝.env ↖️ over there.
// You can get your key and secret from Trello at: https://trello.com/app-key
const key = process.env.TRELLO_KEY;
const secret = process.env.TRELLO_OAUTH_SECRET;


// Trello redirects the user here after authentication
const redirectUri = dev ?
    `http://localhost:3000/api/integrations/trello/callback`
    :
    `https://stickynotespro.m2kdevelopments.com/api/integrations/trello/callback`;

const oauth = new OAuth(requestURL, accessURL, key, secret, "1.0A", redirectUri, "HMAC-SHA1")


export default async function handler(req, res) {
    try {

        // Identify user make api called
        const usertoken = req.query.t;
        if (!usertoken) return res.status(500).json({ result: false, message: 'Unknown user' });
        else setCookie('user', usertoken, { req, res, maxAge: 60 * 60 * 24 });


        oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
            if (error) {
                console.log(error.message);
                return res.status(500).json({ result: false, message: error.message });
            }
            
            setCookie(token, tokenSecret, { req, res, maxAge: 60 * 60 * 24 });
            res.redirect(`${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`);
        });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}
