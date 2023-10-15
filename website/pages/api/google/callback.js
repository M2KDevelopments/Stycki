import User from '../models/user';
import bcrypt from 'bcryptjs';
import generatePassword from 'generate-password';
import jwt from 'jsonwebtoken';
import { send } from '../helpers/email';
import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from '../helpers/mongo';
import axios from 'axios';

const instance = axios.create();
const SECRET = process.env.SECRET;
const SECRET_RT = process.env.SECRET_RT;
const EXPIRES_IN = parseInt(process.env.EXPIRES_IN) * 24 * 60 * 60; // EXPIRES_IN days
const dev = process.env.NODE_ENV !== 'production';

connectToDatabase();

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() !== 'GET') return res.status(404).json({ result: false, message: "Not Found" });
        const oAuth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CLIENT_REDIRECT_URL
        );

        const repsonse = await oAuth2Client.getToken(req.query.code);
        const { access_token } = repsonse.res.data;

        const headers = { 'Authorization': `Bearer ${access_token}` }
        const gmailresponse = await instance.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, { headers })
        const gmail = gmailresponse.data;

        // Create new account
        const password = generatePassword.generate({
            length: 10,
            numbers: true,
            symbols: true,
            uppercase: true,
            excludeSimilarCharacters: true,
        });

        // Generate a salt
        const rounds = 10
        const salt = await bcrypt.genSalt(rounds);

        // Hash the password with the salt
        const hash = await bcrypt.hash(password, salt);

        // Generate referral code
        let referralCode = gmail.name.replace(/\s/gmi, '-')
        const count = await User.count({ referralCode })
        if (count) referralCode += `${referralCode}`;


        // Generate For new user
        const userinfo = {
            name: gmail.name,
            image: gmail.picture,
            googleID: gmail.id,
            email: gmail.email,
            verified: gmail.verified_email,
            referralCode,
            password: hash,
        }

        // Get if user exists
        let user = await User.findOne({ email: userinfo.email });
        if (!user) {

            user = await (new User(userinfo)).save();

            const html = `
        <div style="width:100vw;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
        
        <div style="font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;color:rgb(67, 96, 121);text-align:center;padding:20px;margin:auto 0;width:500px;height:700px;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
            <img src="https://stickynotespro.m2kdevelopments.com/logo.png" alt="Sticky Notes Pro" width="250px"/>
            <br/>
            <h2 style="color:#203444;">
                Welcome to <i>${userinfo.name} (${userinfo.email})</i> <b>Sticky Notes Pro</b>. You're Awesome for Registering with us.
            </h2>
            <br/><br/><br/>
            <h1>YOUR PASSWORD</h1>
            <div style="margin: auto 0; text-align:center;font-weight:900; font-size: 4rem;width:90%; padding:20px; background:rgb(237, 237, 237);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                ${password}
            </div>
            <br/><br/>
            <h2>
                <a href="https://stickynotespro.m2kdevelopments.com">Go To <strong>Sticky Notes Pro</strong> Website</a>
            </h2>
        </div>

        </div>
        `
            // email user account
            console.log('Creating new account', user.email);
            try {
                await send([userinfo.email], 'Verification Email', html);
            } catch (err) {
                console.log(err.message);
            }
        }


        // create access token for user
        const accessToken = jwt.sign({ uid: user._id.toString(), email: user.email, name: user.name }, SECRET, { expiresIn: EXPIRES_IN })
        const refresh_token = jwt.sign({ uid: user._id.toString() }, SECRET_RT, { expiresIn: EXPIRES_IN })

        // save the refresh token
        user.refreshToken = refresh_token;
        await user.save();

        return res.status(200).redirect(dev ? `http://localhost:3000/extension/oauth?token=${accessToken}` : `http://stickynotespro.m2kdevelopments.com/extension/oauth?token=${accessToken}`)
    } catch (e) {
        return res.status(500).json({ result: false, message: e.message });
    }
}