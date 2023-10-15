import jwt from 'jsonwebtoken'

const key = process.env.SECRET;

export function authenticateUser(req, res, skip = false) {
    // Authenticate
    let token = req.headers.authorization;
    if (token) token = token.replace("Bearer ", "")
    const decode = jwt.decode(token, key);
    if (!decode) {
        if (skip) return null;
        else return res.status(403).send('Forbidden');
    }
    return decode;
}