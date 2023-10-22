import Note from '../models/note';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';

connectToDatabase();


export default async function handler(req, res) {
    try {

        if (req.method.toUpperCase() === 'PUT') await put(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function put(req, res) {
    const { uid } = authenticateUser(req, res);
    const { ids, webname } = req.body;
    await Note.updateMany({ id: { $in: ids }, user: uid }, { $set: { webname: webname } })
    return res.status(200).json({ result: true, message: "Notes Rename" });
}