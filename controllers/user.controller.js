const User = require("../models/user.model");
require("dotenv").config();

module.exports = {
    renderRegister: (req, res) => {
        const redirectUrl = req.session.returnTo || "/";
        if(!req.isAuthenticated()){
            return res.render("users/register");
        }
        return res.redirect(redirectUrl);
    },

    postRegister: async (req, res, next) => {
        if(req.isAuthenticated()) return res.redirect("/register");
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                res.redirect('/');
            })
        } catch (e) {
            if(e.code === 11000){
                res.redirect("/register")
            }
        }
    },

    renderLogin: (req, res)=> {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        res.render("users/login");
    }, 

    postLogin: (req, res) => {
        return res.redirect("/");
    },

    logout: (req, res) => {
        req.logout();
        res.redirect("/");
    }
}