import User from '../../../models/user';
import { connectToDatabase } from '../../../helpers/mongo';
import { authenticateUser } from '../../../helpers/auth.user';

connectToDatabase();


export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'POST') await post(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function post(req, res) {
    const { uid } = authenticateUser(req, res)
    const user = await User.findById(uid);
    user.googleSheetsToken = "";
    user.googleSheetsRefreshToken = "";
    await user.save();
    return res.status(200).json({ result: true, message: `${user.name} disconnected from Google sheets successfully` });
}