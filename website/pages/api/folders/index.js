import Folder from '../models/folder';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';

connectToDatabase();


export default async function handler(req, res) {
    try {
        
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else if (req.method.toUpperCase() === 'POST') await post(req, res);
        else if (req.method.toUpperCase() === 'PUT') await put(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {
    const { uid } = authenticateUser(req, res)
    return res.status(200).json(await Folder.find({ user: uid }).lean());
}

async function post(req, res) {
    const { uid } = authenticateUser(req, res);
    const n = new Folder({ user: uid, ...req.body });
    const note = await n.save();
    return res.status(200).json({ result: true, message: "Folder added", note });
}

// Sync folders with local storage
async function put(req, res) {
    const { uid } = authenticateUser(req, res)
    const { folders } = req.body;
    const existing = await Folder.find({ id: { $in: folders.map(p => p.id) } }).select("id").lean();
    const list = folders.filter(note => !existing.find(p => p.id == note.id)).map(post => {
        return { ...post, user: uid }
    });
    if (list.length) await Folder.insertMany(list);
    return res.status(200).json({ result: true, message: "Folders synced" });
}