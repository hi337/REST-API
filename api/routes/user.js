const express = require('express');
const router = express.Router();
const mongooose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const User = require("../models/user")

router.post("/signup", (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(422).json({
                message: "account with address already exists"
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({error: err})
                } else {
                    const user = new User({
                        _id: mongooose.Types.ObjectId(),
                        email: req.body.email ,
                        password: hash
                    })
                    user.save()
                    .then(result => {
                        console.log(result)
                        res.status(201).json({
                            message: "User Created"
                        })
                    })
                    .catch(err => {
                        res.status(200).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
    
})

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email }).exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: "Auth Failed"
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, resp) => {
            if (err) {
                return res.status(401).json({
                    message: "Auth Failed"
                });
            }
            if (resp) {
                const token = jwt.sign({
                    email: user[0].email,
                    id: user[0]._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: '1h'
                })
                return res.status(200).json({
                    message: "Auth Successful",
                    token: token
                })
            }
            res.status(401).json({
                message: "Auth Failed"
            })
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
} )

router.delete("/:userId", (req, res, next) => {
    User.findByIdAndDelete(req.params.userId).exec()
    .then(result => {
        res.status(200).json({message: "User Deleted"})
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;