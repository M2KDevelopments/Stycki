import Notificaition from '../models/notification';
import { connectToDatabase } from '../helpers/mongo';
import admin from 'firebase-admin';
import serviceAccount from '../utils/firebase.json';

if (!admin.apps.length) admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://swearguard-default-rtdb.firebaseio.com"
});

connectToDatabase();

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() !== 'POST') return res.status(404).json({ result: false, message: "Not Found" });
        const { title, message, url, icon, image, from, button1, button2 } = req.body;

        const notifications = await Notificaition.find({}).select("gcm").lean();
        const gcms = notifications.map(n => n.gcm);

        // notifiication message
        const msg = {
            mutable_content: true,
            content_available: true,
            priority: "high",
            notification: { title: title, body: message, image: image ? image : "https://www.swearguard.com/icon.png" },
            tokens: gcms,
            data: {
                content: JSON.stringify({
                    id: parseInt(Math.random() * 100000000).toString(),
                    payload: {
                        from: from ? from : "Swear Guard",
                        url,
                        button1,
                        button2,
                    },
                    channelKey: "basic_channel",
                    title: title,
                    body: message,
                    notificationLayout: "BigPicture",
                    largeIcon: icon ? icon : "",
                    bigPicture: image ? image : "",
                    showWhen: "true",
                    autoDismissable: "true",
                    privacy: "Private",
                }),
                actionButtons: JSON.stringify([])
            }
        };

        const response = await admin.messaging().sendMulticast(msg);
        return res.status(201).json({ message: "Sent Notifications", result: true, response });

    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}