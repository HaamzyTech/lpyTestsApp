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

  const { name, dob, email, password } = req.body
  
  if (!(name && email && dob && password)) res.status(400).send("All inputs are required")

  User.find({email:email }).exec()
    .then( users => {
        if (users.length >= 1 ){
            return res.status(409).json({
                message: "email already taken"
            })
        }
        else{
            bcrypt.hash(password,10, (err, hash)=>{
                if (err){
                    return res.status(500).json({
                        error: err
                    })
                }
                else{
                    const user = new User({
                        name:name,
                        dob:dob,
                        email:email,
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

    const { name, dob, email, password } = req.body
    if (!(name && email && dob && password)) res.status(400).send("All inputs are required")

    User.findOne({id:req.params.id})
        .exec()
        .then( user => {
            if (!user  || user == null ) return res.status(400).json({
                message: "User not found"
            })
            
            user.name = name
            user.dob = dob
            user.email = email

            User.updateOne({id:req.params.id},user)
            .exec()
            .then( result =>{
               return res.sendStatus(200).send(result)
            })
        })

})

router.post('/users/login', (req,res) => {

    User.find({email:req.body.email})
        .exec()
        .then( users => {
            if (users.length < 1 ) return res.sendStatus(404).json({message:"user not found"})
            bcrypt.compare(req.body.password, users[0].password, (err, isEqual) =>{
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
                        token:token,
                        user: { _id, name,email,dob} = users[0]
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

    User.findOne({_id:req.params.id})
        .exec()
        .then( user => {
            if (!user  || user == null ) return res.status(400).json({
                message: "User not found"
            })
            
            return res.status(200).send(user)
        })
})

module.exports = router