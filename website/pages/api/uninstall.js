// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Uninstall from './models/uninstalls';
import { authenticateUser } from './helpers/auth.user';
import { connectToDatabase } from './helpers/mongo';
connectToDatabase();

export default async function handler(req, res) {
    if (req.method.toLowerCase() !== 'get') return res.status(404).json({ message: "NOT FOUND" });

    // Authenticate User
    const tokenuser = authenticateUser(req, res, true);

    const { email, id } = req.query;

    const exists = await Uninstall.findOne({ email: tokenuser ? tokenuser.email : email, chromeID: id });
    if (exists) {
        exists.count++;
        await exists.save();
        return res.status(200).redirect("https://www.swearguard.com/extension/uninstall");
    }

    const uninstall = new Uninstall({ email: tokenuser ? tokenuser.email : email, chromeID: id });
    await uninstall.save();
    return res.status(200).redirect("https://www.swearguard.com/extension/uninstall");
}
