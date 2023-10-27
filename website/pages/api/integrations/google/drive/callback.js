import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from '../../../helpers/mongo';
import User from '../../../models/user';
import { getCookie, deleteCookie } from 'cookies-next';

connectToDatabase();

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() !== 'GET') return res.status(404).json({ result: false, message: "Not Found" });
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'https://stickynotespro.m2kdevelopments.com/api/integrations/google/drive/callback'
        );

        const repsonse = await oAuth2Client.getToken(req.query.code);
        const { access_token, refresh_token } = repsonse.res.data;

        const userToken = getCookie('user', { req, res });
        const { uid } = authenticateUserByToken(userToken)
        deleteCookie('user', { req, res });
        if (uid) {
            const user = await User.findById(uid);
            if (user) {
                user.googleDriveAccessToken = access_token;
                user.googleDriveRefreshToken = refresh_token;
                await user.save();
                console.log('Save Google Drive Integration')
            } else console.log('User not found', uid)
        } else console.log('No User Id Provided');

        return res.status(200).redirect('/integrations/success')
    } catch (e) {
        return res.status(200).redirect('/integrations/failed')
    }
}