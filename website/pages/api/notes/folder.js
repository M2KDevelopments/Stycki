import Note from '../models/note';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';
import runCors from '../helpers/cors';
connectToDatabase();


export default async function handler(req, res) {
    try {
        await runCors(req, res);
        if (req.method.toUpperCase() === 'PUT') await put(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function put(req, res) {
    const { uid } = authenticateUser(req, res);
    const { ids, folder } = req.body;
    await Note.updateMany({ id: { $in: ids }, user: uid }, { $set: { folder: folder } })
    return res.status(200).json({ result: true, message: "Notes Move to Folder" });
}