import { ElevenlabsAPI } from 'elevenlabs-m2k';
import { authenticateUser } from '../helpers/auth.user';
const apiKey = process.env.ELEVENLABS_API_KEY;
const elevenlabs = new ElevenlabsAPI(apiKey);
 
export default async function handler(req, res) {
    try {
        authenticateUser(req, res);
        if (req.method.toUpperCase() === 'POST') await post(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

 
async function post(req, res) {
    return res.status(201).send(await elevenlabs.getAudio(req.body.text, req.body.voice_id)); // Get array buffer);
}

