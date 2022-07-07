const { bookSchema, authorSchema, genreSchema, userSchema, roleSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError');
const Author = require("./models/author.model");
const Book = require("./models/book.model");
const Genre = require("./models/genre.model");
const User = require("./models/user.model");
const Role = require("./models/role.model");
const Cart = require("./models/cart.model");
const List = require("./models/wishlist.model");

require("dotenv").config();

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
       return res.redirect("/login")
    }
    next();
}

module.exports.sendStatus = (req, res, next) => {
    if (!req.isAuthenticated()) {
       return res.sendStatus(401);
    }
    next();
}

module.exports.validateBook = (req, res, next) => {
    const { error } = bookSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.validateAuthor = (req, res, next) => {
    const { error } = authorSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.validateGenre = (req, res, next) => {
    const { error } = genreSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.validateRole = (req, res, next) => {
    const { error } = roleSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}


module.exports.isAdmin = async (req, res, next) => {
    const { _id: id} = req.user;
    const adminRole = await Role.findById(process.env.ADMIN_SECRET_ID);
    const user = await User.find({
        $and: [
            {_id: id}, 
            {_id: {$in: adminRole.users}}
        ]
    });
    if(user.length > 0){
        next();
    }
    else{
        const err = {statusCode: 400, message: "Có lỗi xảy ra, vui lòng thử lại sau"}
        return res.status(400).render('error', { err })
    }
}


module.exports.getAllGenre = async (req, res, next) => {
    const genres = await Genre.find({},"_id genre").lean();
    if(genres){
        res.locals.genres = genres;
    }
    next();
}

module.exports.setUser = async (req, res, next) => {
    if(req.user){
        const cartItems = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]}, "items -_id").lean();
        const listItems = await List.findOne({user: req.user._id}, "list -_id").lean();
        let totalCartItems = 0;
        if(cartItems){
            for(let item of cartItems.items){
                totalCartItems += item.qty;
            }
        }
        res.locals.currentUser = req.user;
        res.locals.total = totalCartItems.toString();
        if(listItems && listItems.list.length > 0){
            res.locals.list = listItems.list.length.toString();
        }
    }
    next();
}


