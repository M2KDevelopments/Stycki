import { google } from 'googleapis';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import User from '../models/user';
import Note from '../models/note';

/**
 * Auto Sync notes in google Sheets
 */
export async function updateGoogleSheets(ids, uid, googlesheets) {
    const notes = await Note.find({ id: { $in: ids }, user: uid }).select("-trellocardId -googlesheets -user -updatedAt").lean();
    const note = notes[0];
    const user = await User.findById(uid);
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    const scopes = ['email', 'profile', "https://www.googleapis.com/auth/spreadsheets"]
    oauth2Client.setCredentials({
        scope: scopes,
        access_token: user.googleSheetsAccessToken,
        refresh_token: user.googleSheetsRefreshToken,
    });


    // Configure Docs
    const gid = googlesheets.replace(/.*\/d\/|\/edit.*/gmi, '');
    console.log('Google Sheets Id', gid);
    let doc;
    try {
        doc = new GoogleSpreadsheet(gid, oauth2Client);
        await doc.loadInfo();
    } catch (e) {
        
        // Update access token
        const response = await oauth2Client.refreshAccessToken();
        // const expires_at = response.credentials.expiry_date;
        const access_token = response.res.data.access_token;
        user.googleSheetsAccessToken = access_token
        await user.save();
        oauth2Client.setCredentials({
            scope: scopes,
            access_token: access_token,
            refresh_token: user.googleSheetsRefreshToken,
        });
        doc = new GoogleSpreadsheet(gid, oauth2Client);
        await doc.loadInfo();
    }

    // Create Sheet
    const existingSheet = doc.sheetsByIndex.find((s) => s.title.replace(/\s/gmi, '') == note.webname.replace(/\s/gmi, ''));
    const sheet = existingSheet ? existingSheet : await doc.addSheet({ title: note.webname });

    // Load Headers
    await sheet.setHeaderRow(Object.keys(note));

    // Add notes
    const rows = await sheet.getRows();

    //update rows
    for (const index in rows) {
        const row = rows[index];
        const n = notes.find(n => n.id === row.get('id'));
        if (n) {

            // check for changes
            let changes = false;
            for (const key of Object.keys(n)) {
                if (row.get(key) != n[key]) {
                    changes = true;
                    break;
                }
            }

            if (changes) {
                row.assign(n);
                await row.save();
            }
        }

    }
    await sheet.saveUpdatedCells();

    //add missing notes
    const missing = notes.filter(n => !rows.find(r => r.get('id') === n.id));
    await sheet.addRows(missing);
}