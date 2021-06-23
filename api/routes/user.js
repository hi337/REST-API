const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user')
const checkAuth = require("../middleware/check_auth")

router.post("/userSignup", UserController.user_signup)

router.post("/chefSignup", UserController.chef_signup)

router.post('/login', UserController.user_login )

router.delete("/:userId", checkAuth, UserController.user_delete)

router.post("/verifyToken", UserController.verify_token)

router.get("/return_url", (req, res, next) => {
    res.sendFile("C:\\Coding Stuff\\JavaScript\\REST API\\api\\html\\return_url.html")
})

module.exports = router;