import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { send } from '../helpers/email';
import { connectToDatabase } from '../helpers/mongo';
connectToDatabase();

const SECRET = process.env.SECRET;
const SECRET_RT = process.env.SECRET_RT;
const EXPIRES_IN = parseInt(process.env.EXPIRES_IN) * 24 * 60 * 60; // EXPIRES_IN days


export default async function oauth(req, res) {
    try {

        if (req.method.toUpperCase() !== 'POST') return res.status(404).json({ result: false, message: "Not Found" });
        
        const { email, password } = req.body;

        // validate email and password
        if (!email || !email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
            console.log(`Please enter email`);
            return res.status(400).json({ result: false, message: `Please enter email` });
        }

        // get user
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log('Could find user', email);
            return res.status(404).json({ result: false, message: `This email is not registered here.` });
        }

        // compare password
        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            console.log('Password do not match', email);
            return res.status(404).json({ result: false, message: `Wrong email or password provided` });
        }

        // create access token for user
        const access_token = jwt.sign({ uid: user._id.toString(), email: user.email, name: user.name }, SECRET, { expiresIn: EXPIRES_IN })
        const refresh_token = jwt.sign({ uid: user._id.toString() }, SECRET_RT, { expiresIn: EXPIRES_IN })

        // save the refresh token
        user.refreshToken = refresh_token;
        await user.save();

        // if this is the first time logging in send welcome email
        if (!user.verified) {
            console.log(`First Time User ${user.email}`)
            user.verified = true;
            const html = `
            <div style="width:100vw;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                <img src="https://www.swearguard.com/logo.png" alt="Swear Guard" width="250px"/>
                <br/>
                <div style="font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;color:rgb(67, 96, 121);text-align:center;padding:20px;margin:auto 0;width:500px;height:400px;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                    <h2 style="color:#203444;">
                        Hey there, ${user.name}, this must be your first time signing up for <a href="https://www.swearguard.com"><strong>Swear Guard</strong></a>.
                    </h2>
                    <h2>Welcome to Swear Guard</h2>
                    <br/><br/><br/>
                </div>
    
            </div>
            `
            // email user account
            await user.save();
            await send([email], 'Reset Your Password', html);

        }

        return res.status(200).json({ result: true, message: `Login successful`, access_token })
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}