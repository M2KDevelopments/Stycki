import Note from '../models/note';
import { connectToDatabase } from '../helpers/mongo';
import { authenticateUser } from '../helpers/auth.user';
import runCors from '../helpers/cors';
import { updateGoogleSheets } from '../helpers/googlesheets';

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
    const { ids, googlesheets, webname, folder, trellocardId } = req.body;
    const update = {};
    if (googlesheets != undefined) update['googlesheets'] = googlesheets;
    if (webname != undefined) update['webname'] = webname;
    if (folder != undefined) update['folder'] = folder;
    if (trellocardId != undefined) update['trellocardId'] = trellocardId;

    await Note.updateMany({ id: { $in: ids }, user: uid }, { $set: update });

    // Update Google Sheets - when change google sheets link
    if (googlesheets) await updateGoogleSheets(ids, uid, googlesheets)

    return res.status(200).json({ result: true, message: "Notes have been updated" });
}

