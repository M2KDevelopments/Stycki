import { connectToDatabase } from './helpers/mongo';
import admin from 'firebase-admin';
import serviceAccount from './utils/firebase.json';


if (!admin.apps.length) admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
connectToDatabase();

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else if (req.method.toUpperCase() === 'POST') await post(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {
    const {id} = req.query;
    console.log(id)
    return res.status(200).redirect("/");
}

async function post(req, res) {
    return res.status(201).json({ result: true, message: `Purchase was successful` });
}

