import jwt from 'jsonwebtoken'

const ADMIN_DASHBOARD_EMAIL = process.env.ADMIN_DASHBOARD_EMAIL
const ADMIN_DASHBOARD_PASS = process.env.ADMIN_DASHBOARD_PASS
const key = process.env.SECRET;


export function authenticateAdmin(req, res) {
    // Authenticate
    let token = req.headers.authorization;
    if (token) token = token.replace("Bearer ", "")
    const decode = jwt.decode(token, key);
    if (!decode) return res.status(403).send('Forbidden');
    const { email, password } = decode;
    if (email != ADMIN_DASHBOARD_EMAIL || password != ADMIN_DASHBOARD_PASS) return res.status(403).send('Forbidden');
}