import User from '../../models/user';
import jwt from 'jsonwebtoken';
import { send } from '../../helpers/email';
import { connectToDatabase } from '../../helpers/mongo';
connectToDatabase();


const SECRET = process.env.SECRET;
const dev = process.env.NODE_ENV !== 'production';

export default async function forgotPassword(req, res) {
    try {

        if (req.method.toUpperCase() !== 'POST') return res.status(404).json({ result: false, message: "Not Found" });
        

        const { email } = req.body;

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

        const userToken = jwt.sign({ uid: user._id, username: user.name, useremail: user.email, expires: Date.now() + (120 * 1000) }, SECRET, { expiresIn: 120 })
        const html = `
        <div style="width:100vw;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
        
            <div style="font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;color:rgb(67, 96, 121);text-align:center;padding:20px;margin:auto 0;width:500px;height:400px;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                <img src="https://stickynotespro.m2kdevelopments.com/logo.png" alt="Sticky Notes Pro" width="250px"/>
                <br/>
                <h2 style="color:#203444;">
                    Hey there, ${user.name}, if you want to reset your password click the button or the link below.
                </h2>
                <h3>
                    <a 
                        style="color: #e4e4e4;text-decoration: none; margin: auto 0; text-align:center;font-weight:900; font-size: 2rem;width:90%; padding:10px 20px; background:linear-gradient(30deg, rgb(161, 62, 247), rgb(4, 62, 130));border: 0px solid #959da533;border-radius:60px;box-shadow: #959da533 0px 8px 24px;"
                        href="${dev ? `http://localhost:3000/password?user=${userToken}` : `https://stickynotespro.m2kdevelopments.com/password?user=${userToken}`}">Reset Password</a>
                <h3/>
            </div>

        </div>
        `
        // email user account
        const emailresponse = await send([email], 'Reset Your Password', html);
        return res.status(200).json({ result: true, message: `Reset Password Email Sent`, emailresponse })
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}