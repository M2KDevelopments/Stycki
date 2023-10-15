import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/user';
import { connectToDatabase } from '../../helpers/mongo';
connectToDatabase();

const SECRET = process.env.SECRET;
const dev = process.env.NODE_ENV !== 'production';


export default async function passwordReset(req, res) {
    try {
 
        if (req.method.toUpperCase() !== 'POST') return res.status(404).json({ result: false, message: "Not Found" });

        const { newPassword, confirmPassword, token } = req.body;
        const decode = jwt.decode(token, SECRET);
        const { uid, username, useremail, expires } = decode;

        if (!uid) {
            console.log('No user ID', useremail);
            return res.status(200).redirect(dev ? `http://localhost:3000/password/failed` : `http://stickynotespro.m2kdevelopments.com/password/failed`)
        }

        if (!newPassword || !confirmPassword) {
            console.log('Missing required fields',useremail);
            return res.status(200).redirect(dev ? `http://localhost:3000/password/failed` : `http://stickynotespro.m2kdevelopments.com/password/failed`)
        }

        if (newPassword !== confirmPassword) {
            console.log('New password and confirm password do not match', useremail);
            return res.status(200).redirect(dev ? `http://localhost:3000/password/failed` : `http://stickynotespro.m2kdevelopments.com/password/failed`)
        }

        const user = await User.findById(uid).select("email password");
        if (!user) {
            console.log('No user found', useremail);
            return res.status(200).redirect(dev ? `http://localhost:3000/password/failed` : `http://stickynotespro.m2kdevelopments.com/password/failed`)
        }

        if (Date.now() > new Date(expires).getTime()) {
            console.log('Expired Time to change password', useremail);
            return res.status(200).redirect(dev ? `http://localhost:3000/password/failed` : `http://stickynotespro.m2kdevelopments.com/password/failed`)
        }


        // Generate a salt
        const rounds = 10
        const salt = await bcrypt.genSalt(rounds);

        // Hash the password with the salt
        const hash = await bcrypt.hash(newPassword, salt);

        // Update the password
        user.password = hash
        await user.save();

        console.log(`Updated Password For`, user.email);
        return res.status(200).redirect(dev ? `http://localhost:3000/password/success` : `http://stickynotespro.m2kdevelopments.com/password/success`)
    } catch (e) {
        console.log(e.message);
        return res.status(200).redirect(dev ? `http://localhost:3000/password/failed` : `http://stickynotespro.m2kdevelopments.com/password/failed`)
    }
}