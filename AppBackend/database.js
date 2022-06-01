const { default: mongoose } = require('mongoose')
const mogoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/applicants', ()=>{
    console.log("Database connection established")
})

module.exports = mongoose