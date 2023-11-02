import Folder from '../models/folder';
import Note from '../models/note';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';

connectToDatabase();


export default async function handler(req, res) {
    try {

        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else if (req.method.toUpperCase() === 'PATCH') await patch(req, res);
        else if (req.method.toUpperCase() === 'DELETE') await remove(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {
    const { uid } = authenticateUser(req, res);
    const { id } = req.query;
    const f = await Folder.findOne({ id, user: uid }).lean();
    const notes = Note.find({ folder: id }).lean();
    return res.status(200).json({ folders: f, notes });
}

async function patch(req, res) {
    const { uid } = authenticateUser(req, res);
    const { name } = req.body;
    const { id } = req.query;
    const note = await Folder.findOne({ id, user: uid });
    if (name != undefined) note.name = name;
    await note.save();
    return res.status(200).json({ result: true, message: "Folder updated" });
}


async function remove(req, res) {
    const { uid } = authenticateUser(req, res);
    const { id } = req.query;
    await Folder.deleteOne({ id, user: uid });
    await Note.updateMany({ folder: id }, { $set: { folder: "" } })
    return res.status(200).json({ result: true, message: "Folder deleted" });
}