import User from '../models/user';
import Note from '../models/note';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';
import runCors from '../helpers/cors';
connectToDatabase();


export default async function handler(req, res) {
    try {
        await runCors(req, res);
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
    return res.status(200).json(await Note.find({ user: uid }).lean());
}

async function post(req, res) {
    const { uid } = authenticateUser(req, res);

    // Check if user has note space
    const count = await Note.countDocuments({ user: uid });
    const user = await User.findById(uid);
    if (user.count <= count) return res.status(200).json({ result: false, message: `Upgrade to add more notes` });

    // Check if the note already exists
    const exists = await Note.findOne({ id: req.body.id, user: uid }).select('name').lean();
    if (exists) return res.status(200).json({ result: false, message: `Note already exists` });


    const n = new Note({ user: uid, ...req.body });
    const note = await n.save();
    return res.status(200).json({ result: true, message: "Note added", note });
}

// Sync notes with local storage
async function put(req, res) {
    const { uid } = authenticateUser(req, res)
    const { notes } = req.body;
    const existing = await Note.find({ id: { $in: notes.map(p => p.id) } }).select("id").lean();
    const list = notes.filter(note => !existing.find(p => p.id == note.id)).map(post => {
        return { ...post, user: uid }
    });
    if (list.length) await Note.insertMany(list);
    return res.status(200).json({ result: true, message: "Notes synced" });
}