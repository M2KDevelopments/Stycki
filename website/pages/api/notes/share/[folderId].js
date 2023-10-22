import Note from '../../models/note';
import { connectToDatabase } from '../../helpers/mongo';
import { authenticateUser } from '../../helpers/auth.user';
connectToDatabase();


export default async function handler(req, res) {
    try {
        authenticateUser(req, res);
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}


async function get(req, res) {
    const { folderId } = req.query;
    const notes = await Note.find({ folder: folderId }).lean();
    return res.status(200).json(notes);
}