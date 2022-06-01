const jwt = require('jsonwebtoken')
const secret = require('../secret.json')

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization
        const decoded = jwt.verify(token, secret.key);
        req.userData = decoded
        next()
    } catch(error){
        return res.sendStatus(401)
    }
    
}