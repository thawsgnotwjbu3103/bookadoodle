const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const CatchAsync = require("../utils/CatchAsync");
const passport = require('passport');

router.get("/register", userController.renderRegister);
router.post("/register" ,CatchAsync(userController.postRegister));

router.get("/login", userController.renderLogin);
router.post("/login", 
passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
userController.postLogin);

router.get("/logout", userController.logout);
module.exports = router;