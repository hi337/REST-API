const mongooose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const fetch = require("node-fetch")

exports.user_signup = (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(422).json({
                message: "account with address already exists"
            })
        } else {
            console.log(req.body)
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({error: err})
                } else {
                    const user = new User({
                        _id: mongooose.Types.ObjectId(),
                        email: req.body.email ,
                        password: hash,
                        address: req.body.address,
                        phone: req.body.phone,
                        fullName: req.body.fullName,
                        accountType: "user"
                    })
                    user.save()
                    .then(result => {
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
}

exports.chef_signup = (req, res, next) => {
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
                        password: hash,
                        address: req.body.address,
                        phone: req.body.phone,
                        fullName: req.body.fullName,
                        accountType: "chef",
                        activated: false
                    })                 
                    const ACCESS_TOKEN = "A21AAKn4euEu1hmP1CteUD0e3SNSYx0nMSUzHHD7K2kQfnEm2fSEh5kOwx6bLE84cDPD6SEv-BduVVyAWazuJ1NS3FCmkFL0Q"
                    // paypal api
                    fetch("https://api-m.sandbox.paypal.com/v2/customer/partner-referrals", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer "+ ACCESS_TOKEN
                        },
                        body: JSON.stringify({
                            "tracking_id": String(user._id),
                            "operations": [
                            {
                                "operation": "API_INTEGRATION",
                                "api_integration_preference": {
                                    "rest_api_integration": {
                                        "integration_method": "PAYPAL",
                                         "integration_type": "THIRD_PARTY",
                                         "third_party_details": {
                                            "features": [
                                                "PAYMENT",
                                                "REFUND"
                                            ]
                                        }
                                    }
                                }
                            }
                          ],
                          "products": [
                              "EXPRESS_CHECKOUT"
                           ],
                          "legal_consents": [
                            {
                               "type": "SHARE_DATA_CONSENT",
                               "granted": true
                            }
                          ],
                          "partner_config_overide": {
                              "return_url": "http://192.168.1.73:5000/user/return_url"
                          }
                        })
                    })
                    .then(async result => {
                        if (result.ok) {
                            return result.json()
                        } else {
                            throw new Error(await result.json())
                        }
                    })
                    .then(json => {
                        user.save()
                        return res.status(201).json({
                            message: "User Created",
                            json
                        })
                    })
                    .catch(err => {
                        console.log(err.message)
                        return res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
}

exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email }).exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: "Auth Failed"
            })
        }
        if (user[0].accountType === "chef") {
            bcrypt.compare(req.body.password, user[0].password, (err, resp) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth Failed"
                    })
                }
                if (resp) {
                    fetch("https://api-m.sandbox.paypal.com/v1/customer/partners/partner_id/merchant-integrations?tracking_id="+ user[0]._id)
                    .then(resp => resp.json())
                    .then(json => res.status(201).json({json}))
                }
            })
        } else {

        bcrypt.compare(req.body.password, user[0].password, (err, resp) => {
            if (err) {
                return res.status(401).json({
                    message: "Auth Failed"
                });
            }
            if (resp) {
                const token = jwt.sign({
                    email: user[0].email,
                    accountType: user[0].accountType,
                    address: user[0].address,
                    phone: user[0].phone,
                    id: user[0]._id,
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "7d"
                })
                return res.status(200).json({
                    message: "Auth Successful",
                    accountType: user[0].accountType,
                    token: token
                })
            }
            res.status(401).json({
                message: "Auth Failed"
            })
        })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.user_delete = (req, res, next) => {
    User.findByIdAndDelete(req.params.userId).exec()
    .then(result => {
        res.status(200).json({message: "User Deleted"})
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.verify_token = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const id = decoded.id
        User.findById(id)
        .then(resp => {
            res.status(200).json({
               message: "Token Valid"
            })
        })
    } catch (e) {
        res.status(500).json({
            message: "Token Invalid"
        })
    }
}