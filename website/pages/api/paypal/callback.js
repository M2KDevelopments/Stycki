// PayPal NodeJs Documenations - https://developer.paypal.com/docs/checkout/standard/integrate/
import bcrypt from 'bcryptjs'
import generatePassword from 'generate-password'
import { send } from '../helpers/email'
import User from '../models/user'
import PayPal from '../models/paypal'
import PRICES from '../utils/prices.json'
import axios from 'axios';
const instance = axios.create();

// Pay Pal Credientials
const dev = process.env.NODE_ENV !== 'production';
const PAYPAL_CLIENT_ID = !dev ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_CLIENT_ID_DEV;
const PAYPAL_APP_SECRET = !dev ? process.env.PAYPAL_APP_SECRET : process.env.PAYPAL_APP_SECRET_DEV;

// Pay Pal Backend URL
const baseURL = { url: dev ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com" };


// use the orders api to capture payment for an order
export default async function handler(req, res) {
    try {
        const { orderID, id } = req.body;
        const accessToken = await generateAccessToken();
        const url = `${baseURL.url}/v2/checkout/orders/${orderID}/capture`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        }
        const body = {}
        const response = await instance.post(url, body, { headers });
        const data = response.data
        await updateFeatures(data.payer.email_address, data, id)
        const paypal = new PayPal(data);
        await paypal.save();
        return res.status(200).json(data);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message, result: false });
    }
}

async function updateFeatures(email, paypal, id) {

    const user = await User.findOne({ email });
    const index = Math.abs(parseInt(id)) > 1 ? 1 : Math.abs(parseInt(id))
    const priceplan = PRICES[index];

    //Paypal info
    const { given_name, surname } = paypal.payer.name;
    const name = `${given_name} ${surname}`;

    if (user) {
        user.count += priceplan.activate.counter;
        if (priceplan.activate.integrations) user.integrations = true;
        await user.save();


    } else {


        let referralCode = name.replace(/\s/gmi, '-')
        const count = await User.count({ referralCode })
        if (count) referralCode += `${referralCode}`;

        // Create new account
        const password = generatePassword.generate({
            length: 10,
            numbers: true,
            symbols: true,
            uppercase: true,
            excludeSimilarCharacters: true,
        });

        // Generate a salt
        const rounds = 10
        const salt = await bcrypt.genSalt(rounds);

        // Hash the password with the salt
        const hash = await bcrypt.hash(password, salt);

        const u = new User({
            name,
            email,
            verified: true,
            referralCode,
            password: hash,
            count: priceplan.activate.counter + 40,
            integrations: priceplan.activate.integrations
        })

        await u.save();


        const html = `
        <div style="width:100vw;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
        
        <div style="font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;color:rgb(67, 96, 121);text-align:center;padding:20px;margin:auto 0;width:500px;height:700px;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
            <img src="${process.env.APP_LOGO}" alt="${process.env.APP_NAME}" width="100px"/>
            <br/>
            <h2 style="color:#203444;">
                Welcome to <i>${name} (${email})</i> <b>${process.env.APP_NAME}</b>. You're Awesome for Registering with us.
            </h2>
            <br/><br/><br/>
            <h1>YOUR PASSWORD</h1>
            <div style="margin: auto 0; text-align:center;font-weight:900; font-size: 4rem;width:90%; padding:20px; background:rgb(237, 237, 237);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                ${password}
            </div>
            <br/><br/>
            <h2>
                <a href="${process.env.APP_WEBSITE}">Go To <strong>${process.env.APP_NAME}</strong> Website</a>
            </h2>
        </div>

        </div>
        `
        // email user account
        try {
            await send([email], 'Sticky Notes Registration', html);
        } catch (err) {
            console.log(err.message);
        }
    }

    const { currency_code, value } = paypal.purchase_units[0].payments.captures[0].amount;
    const htmlPurchase = `
        <div style="width:100vw;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
        
        <div style="font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;color:rgb(67, 96, 121);text-align:center;padding:20px;margin:auto 0;width:500px;height:700px;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
            <img src="${process.env.APP_LOGO}" alt="${process.env.APP_NAME}" width="100px"/>
            <br/>
            <h2 style="color:#203444;">
               Hey ${name}, your awesome! Thanks so much for purchasing Sticky Notes Pro.
            </h2>
            <br/><br/><br/>
            <h1>Transaction ID: ${paypal.id}</h1>
            <div style="margin: auto 0; text-align:center;font-weight:900; font-size: 4rem;width:90%; padding:20px; background:rgb(237, 237, 237);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                ${currency_code} ${value}
            </div>
            <br/><br/>
            <h2>
                <a href="${process.env.APP_WEBSITE}">Go To <strong>${process.env.APP_NAME}</strong> Website</a>
            </h2>
        </div>

        </div>
        `
    // email user account
    try {
        await send([email], 'Sticky Notes Purchase', htmlPurchase);
    } catch (err) {
        console.log(err.message);
    }
}

// generate an access token using client id and app secret
async function generateAccessToken() {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET).toString("base64");
    const body = 'grant_type=client_credentials'
    const headers = { Authorization: `Basic ${auth}` };
    const response = await instance.post(`${baseURL.url}/v1/oauth2/token`, body, { headers });
    const data = response.data
    return data.access_token;
}