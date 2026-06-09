const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const warpAsync = require("../utils/warpAsync.js");
const passport = require("passport");
const { saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/signup",(userController.rendersingupform));

router.post("/signup", warpAsync(userController.singup));

router.get("/login", (userController.renderlogin));

router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}),
(userController.redirectlogin));

router.get("/logout", (userController.redirectlogout));

module.exports = router;