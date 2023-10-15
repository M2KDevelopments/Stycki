import User from './models/user';
import Purchase from './models/purchase';
import PricePlans from './models/priceplan'
import { connectToDatabase } from './helpers/mongo';
import { authenticateUser } from './helpers/auth.user';
import Features from './models/feature';
import admin from 'firebase-admin';
import serviceAccount from './utils/firebase.json';
import Notificaition from './models/notification';


if (!admin.apps.length) admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://swearguard-default-rtdb.firebaseio.com"
});
connectToDatabase();

export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'GET') await get(req, res);
        else if (req.method.toUpperCase() === 'POST') await post(req, res);
        else if (req.method.toUpperCase() === 'PATCH') await patch(req, res);
        else if (req.method.toUpperCase() === 'DELETE') await remove(req, res);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}

async function get(req, res) {

    // Authenticate User
    const tokenuser = authenticateUser(req, res);

    // Get User
    const notification_id = req.headers.chromenotificationid
    const user = await User.findById(tokenuser.uid).select('name image email words gcmChrome gcmWeb gcmAndroid aiTokens referredBy');
    if (user.gcmChrome !== notification_id && notification_id) {
        console.log("Update", user.name, 'Notification ID');
        user.gcmChrome = notification_id;
        await user.save();
    }



    // Get Purchase
    const purchases = await Purchase.find({ customer_email: user.email }).sort({ createdAt: -1 }).select("charge_name").limit(6).lean();
    if (!purchases.length) {
        console.log("No Purchases", user.email);
        return res.status(200).json({ user, features: new Features() });
    }

    const priceplans = await PricePlans.find({}).lean();
    const plan = priceplans.find(p => p.name === purchases[0].charge_name);

    if (!plan) {
        console.log("Could not find Plan", purchases[0].charge_name, 'for', user.email);
        return res.status(200).json({ user, features: new Features() });
    }

    // Get Feature for plan
    const features = await Features.findOne({ priceplan_id: plan._id }).lean();

    return res.status(200).json({ user, features: features ? features : new Features(), priceplan_name: plan.name });
}

async function post(req, res) {

    const { words, websites } = req.body;

    // Authenticate User
    const tokenuser = authenticateUser(req, res);

    const user = await User.findById(tokenuser.uid).select("email words");

    if (words != undefined && words != null) user.words = words.filter(word => word && typeof word === 'string' ? true : false);
    if (websites != undefined && websites != null) user.websites = websites.filter(www => www && typeof www === 'string' ? true : false);

    await user.save()
    console.log('Updated', user.name, user.email, '');
    return res.status(201).json({ result: true, message: `${user.name}'s Preferences Updated` });
}

async function patch(req, res) {

    const { tokens, referredBy } = req.body;

    // Authenticate User
    const tokenuser = authenticateUser(req, res);
    const user = await User.findById(tokenuser.uid)


    if (tokens) {
        user.aiTokens -= Math.abs(parseInt(tokens));
        await user.save()
        console.log('Updated', user.name, user.email, tokens, 'Tokens Removed');
        return res.status(201).json({ result: true, message: `${user.name}'s Tokens Updated`, aiTokens: user.aiTokens });
    } else if (referredBy) {
        if (!user.referredBy) {

            // Check if referral is the same user
            if (user._id.toString() === referredBy) {
                console.log(`${user.email} cannot refer thrmself`);
                return res.status(200).json({ result: false, message: "You cannot refer yourself" });
            }

            // Get Referral User
            const userReferal = await User.findById(referredBy);

            if (userReferal) {

                // Update referral
                user.referredBy = referredBy;

                // Award People for update new referral
                user.aiTokens += 20;
                userReferal.aiTokens += 30;
                await user.save();
                await userReferal.save();

                // Send Notification users
                await sendNotification(user.gcmChrome, `Thanks ${user.name} You've got a bonus ${20} tokens from using ${userReferal.name}'s referral link`)
                await sendNotification(userReferal.gcmChrome, `Hey ${userReferal.name} You've got a bonus ${30} tokens for a new referral ${user.name}`);

                console.log(user.name, user.email, 'Was Referred to By', userReferal.name, userReferal.email);
                return res.status(201).json({ result: true, message: `${user.name}'s Referral Updated` });
            } else console.log('Referral', referredBy, 'NOT FOUND');
        } else console.log(user.name, user.email, 'Already referred');
    }

    return res.status(201).json({ result: false, message: `${user.name}'s Preferences Left alone` });
}

async function remove(req, res) {

    // Authenticate User
    const tokenuser = authenticateUser(req, res);
    const user = await User.findByIdAndDelete(tokenuser.uid)
    console.log('Removed', user.name, user.email);
    return res.status(201).json({ result: true, message: `Removed Your Account Successfully` });
}

async function sendNotification(gcm, message) {

    const notification = await Notificaition.findById(gcm);
    if (!notification) return;

    // notifiication message
    const msg = {
        mutable_content: true,
        content_available: true,
        priority: "high",
        notification: { title: "AI Token Update 💎", body: message, image: "https://www.swearguard.com/icon.png" },
        tokens: [notification.gcm],
        data: {
            content: JSON.stringify({
                id: parseInt(Math.random() * 100000000).toString(),
                payload: {
                    from: "Swear Guard",
                },
                channelKey: "basic_channel",
                title: "AI Token Update 💎",
                body: message,
                notificationLayout: "BigPicture",
                largeIcon: "",
                bigPicture: "",
                showWhen: "true",
                autoDismissable: "true",
                privacy: "Private",
            }),
            actionButtons: JSON.stringify([])
        }
    };

    return await admin.messaging().sendMulticast(msg);
}