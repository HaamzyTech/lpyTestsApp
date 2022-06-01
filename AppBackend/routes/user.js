const express = require('express')
const router = express()
const User = require('../model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secret = require('../secret.json')
const checkAuth = require('../middleware/auth')

router.use(express.json())

/**
 * User Registration
 */
router.post('/users/register', ( req, res)=> {

  const { username, userdob, useremail, userpassword } = req.body
  
  if (!(username && useremail && userdob && userpassword)) res.status(400).send("All inputs are required")

  User.find({email:useremail }).exec()
    .then( users => {
        if (users.length >= 1 ){
            return res.status(409).json({
                message: "email already taken"
            })
        }
        else{
            bcrypt.hash(userpassword,10, (err, hash)=>{
                if (err){
                    return res.status(500).json({
                        error: err
                    })
                }
                else{
                    const user = new User({
                        name:username,
                        dob:userdob,
                        email:useremail,
                        password:hash
                    })

                    user.save()
                        .then( result => res.sendStatus(201))
                        .catch(err => res.status(500).json({error:err}))

                }
            })
        }
    })

})

router.put('/users/update/:id', checkAuth, (req, res)=> {

    const { username, userdob, useremail, userpassword } = req.body
    if (!(username && useremail && userdob && userpassword)) res.status(400).send("All inputs are required")

    User.findOne({id:req.params.id})
        .exec()
        .then( user => {
            if (!user  || user == null ) return res.status(400).json({
                message: "User not found"
            })
            
            user.name = username
            user.dob = userdob
            user.email = useremail

            User.updateOne({id:req.params.id},user)
            .exec()
            .then( result =>{
               return res.status(200).send(result)
            })
        })

})

router.post('/users/login', (req,res) => {

    User.find({email:req.body.useremail})
        .exec()
        .then( users => {
            if (users.length < 1 ) return res.sendStatus(404).json({message:"user not found"})
            bcrypt.compare(req.body.userpassword, users[0].password, (err, isEqual) =>{
                if (err) return res.sendStatus(401)
                if (isEqual) {
                    const token = jwt.sign(
                        {
                            email:users[0].email,
                            userId: users[0]._id
                        },
                        secret.key,
                        {
                            expiresIn:"1h"
                        }
                    )

                    return res.status(200).json({
                        message:"login successful",
                        token:token
                    })
                }
                res.sendStatus(401)
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error:err
            })
        })
})

router.get('/users/:id',checkAuth, ( req, res) => {

    User.findOne({id:req.params.id})
        .exec()
        .then( user => {
            if (!user  || user == null ) return res.status(400).json({
                message: "User not found"
            })
            
            return res.status(200).send(user)
        })
})

module.exports = router