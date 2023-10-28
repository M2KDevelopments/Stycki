import Note from '../models/note';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';
import runCors from '../helpers/cors';
import { updateGoogleSheets } from '../helpers/googlesheets';
import { updateTrelloNotes } from '../helpers/trello';

connectToDatabase();


export default async function handler(req, res) {
    try {
        await runCors(req, res);
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
    const note = await Note.findOne({ id, user: uid }).lean();
    return res.status(200).json(note);
}

async function patch(req, res) {
    const { uid } = authenticateUser(req, res);
    const { name, webname, text, minimized, color, url, x, y, folder } = req.body;
    const { id } = req.query;
    const note = await Note.findOne({ id, user: uid });
    if (name != undefined) note.name = name;
    if (webname != undefined) note.webname = webname;
    if (text != undefined) note.text = text;
    if (minimized != undefined) note.minimized = minimized;
    if (color != undefined) note.color = color;
    if (url != undefined) note.url = url;
    if (x != undefined) note.x = x;
    if (y != undefined) note.y = y;
    if (folder != undefined) note.folder = folder;

    await note.save();


    // Update Trello Cards - when notes name or text change
    if (note.trellocardId && (name != undefined || text != undefined)) await updateTrelloNotes(note);

    // Update Google Sheets - when notes change
    try {
        if (note.googlesheets) await updateGoogleSheets([note.id], uid, note.googlesheets);
    } catch (e) {
        console.log(e.message);
    }finally{
        return res.status(201).json({ result: true, message: "Note updated" });
    }    
}

async function remove(req, res) {
    const { uid } = authenticateUser(req, res);
    const { id } = req.query;
    await Note.deleteOne({ id, user: uid });
    return res.status(201).json({ result: true, message: "Note deleted" });
}