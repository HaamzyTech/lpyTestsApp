const db = require('../database')

const userSchema = new db.Schema({
    name: { type: String, default: null },
    dob: { type: Date, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
}, {
    timestamps:true
});

const User = db.model("User",userSchema)

module.exports = User