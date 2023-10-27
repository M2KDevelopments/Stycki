import { OAuth2Client } from 'google-auth-library';
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';

export default async function handler(req, res) {
    try {

        // Identify user make api called
        const usertoken = req.query.t;
        if (!usertoken) return res.status(500).json({ result: false, message: 'Unknown user' });
        else setCookie('user', usertoken, { req, res, maxAge: 60 * 60 * 24 });

        
        if (req.method.toUpperCase() !== 'GET') return res.status(404).json({ result: false, message: "Not Found" });
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://stickynotespro.m2kdevelopments.com/api/integrations/google/sheets/callback'
        );

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/spreadsheets'
            ],
        });

        return res.status(200).redirect(authorizeUrl);
    } catch (e) {
        return res.status(500).json({ result: false, message: e.message });
    }
}



