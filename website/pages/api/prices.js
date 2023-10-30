import prices from './utils/prices.json';
export default async function handler(req, res) {
    try {
        if (req.method.toUpperCase() === 'GET') return res.status(200).json(prices);
        else return res.status(404).json({ result: false, message: "Not Found" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}
 

