import { OAuth2Client } from 'google-auth-library';

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() !== 'GET') return res.status(404).json({ result: false, message: "Not Found" });
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CLIENT_REDIRECT_URL
        );

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ],
        });

        return res.status(200).redirect(authorizeUrl);
    } catch (e) {
        return res.status(500).json({ result: false, message: e.message });
    }
}



