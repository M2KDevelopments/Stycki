// PayPal NodeJs Documenations - https://developer.paypal.com/docs/checkout/standard/integrate/
import axios from 'axios';
import PRICES from '../utils/prices.json'
const instance = axios.create();

// Pay Pal Credientials
const dev = process.env.NODE_ENV !== 'production';
const PAYPAL_CLIENT_ID = !dev ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_CLIENT_ID_DEV;
const PAYPAL_APP_SECRET = !dev ? process.env.PAYPAL_APP_SECRET : process.env.PAYPAL_APP_SECRET_DEV;

// Pay Pal Backend URL
const baseURL = { url: dev ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com" };

// use the orders api to create an order
export default async function handler(req, res) {
    try {
        const { cart } = req.body;
        const id = cart[0].sku;
        const index = Math.abs(parseInt(id)) > 1 ? 1 : Math.abs(parseInt(id))
        const priceplan = PRICES[index]
        const accessToken = await generateAccessToken();
        const url = `${baseURL.url}/v2/checkout/orders`;
        const body = {
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: "USD",
                    value: `${priceplan.price * 100}`, //in cents
                },
            }]
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        }
        const response = await instance.post(url, body, { headers });
        const order = response.data;

        return res.status(201).json(order);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message, result: false });
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