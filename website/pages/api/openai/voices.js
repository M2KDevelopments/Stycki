import { ElevenlabsAPI } from 'elevenlabs-m2k';
import { authenticateUser } from '../helpers/auth.user';
const apiKey = process.env.ELEVENLABS_API_KEY;
const elevenlabs = new ElevenlabsAPI(apiKey);

export default async function handler(req, res) {
    try {
        authenticateUser(req, res);
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ result: false, message: e.message });
    }
}

 
async function get(req, res) {
    return res.status(201).json(await elevenlabs.getVoices());
}

