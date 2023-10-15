import Notificaition from '../models/notification';
import { connectToDatabase } from '../helpers/mongo';
connectToDatabase();

export default async function handler(req, res) {
    try {

        if (req.method.toUpperCase() !== 'POST') return res.status(404).json({ result: false, message: "Not Found" });

        const { gcm, notificationId, platform } = req.body;

        if (!gcm) return res.status(400).json({ message: "No GCM token", result: false });
        if (notificationId) {
            const note = await Notificaition.findById(notificationId);
            if (note) {
                note.gcm = gcm;
                await note.save();
                return res.status(201).json({ message: "Updated notification id", result: true, id: notificationId });
            } else {
                const newnotification = new Notificaition({ gcm, platform: platform ? platform : 'extension' });
                const notification = await newnotification.save();
                return res.status(201).json({ message: "Created notification id", result: true, id: notification._id });
            }
        }

        const newNotification = new Notificaition({ gcm, platform: platform ? platform : 'extension' });
        const notifi = await newNotification.save();
        return res.status(201).json({ message: "Created notification id", result: true, id: notifi._id });

    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}