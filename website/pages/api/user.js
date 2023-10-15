import User from './models/user';
import { connectToDatabase } from './helpers/mongo';
import { authenticateUser } from './helpers/auth.user';
import admin from 'firebase-admin';
import serviceAccount from './utils/firebase.json';


if (!admin.apps.length) admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://swearguard-default-rtdb.firebaseio.com"
});
connectToDatabase();

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else if (req.method.toUpperCase() === 'POST') await post(req, res);
        else if (req.method.toUpperCase() === 'PATCH') await patch(req, res);
        else if (req.method.toUpperCase() === 'DELETE') await remove(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {

    // Authenticate User
    const tokenuser = authenticateUser(req, res);

    // Get User
    const notification_id = req.headers.chromenotificationid
    const user = await User.findById(tokenuser.uid).select('name image email words gcmChrome gcmWeb gcmAndroid aiTokens referredBy');
    if (user.gcmChrome !== notification_id && notification_id) {
        console.log("Update", user.name, 'Notification ID');
        user.gcmChrome = notification_id;
        await user.save();
    }


    return res.status(200).json(user);
}

async function remove(req, res) {

    // Authenticate User
    const tokenuser = authenticateUser(req, res);
    const user = await User.findByIdAndDelete(tokenuser.uid)
    console.log('Removed', user.name, user.email);
    return res.status(201).json({ result: true, message: `Removed Your Account Successfully` });
}

