const Book = require("../models/book.model");
const Genre = require("../models/genre.model");
const Review = require("../models/review.model");
const Author = require("../models/author.model");
const Cart = require("../models/cart.model");
const Pay = require("../models/paycheck.model");
const Wishlist = require("../models/wishlist.model");
const nodemailer = require("nodemailer");
require("dotenv").config();

const { isObjectId } = require("../utils/MongooseValidation");
const err = {
    statusCode: 404,
    message: "Không tìm thấy trang này, vui lòng thử lại sau",
};

module.exports = {
    homePage: async (req, res) => {
        const limit = 8;
        const page = parseInt(req.query.page) || 1;
        const query = req.query.q;
        const paginatedDocs = await Book.paginate({title: query}, {page, limit});
        const {docs: books, hasPrevPage, hasNextPage} = paginatedDocs;
        res.render("shop/trang-chu", {books, hasPrevPage, hasNextPage, page});
    },
    productDetails: async(req, res) => {
        const { id } = req.params;
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        if(isObjectId(id)){
            const book = await Book.findById(id).populate("genre author");
            if(book){
                const reviewDocs = await Review.paginate({
                    _id: {
                        $in: book.reviews
                    }
                }, {populate: "user", page, limit});

                const rating = await Review.aggregate([{
                    $match: {
                        _id: {
                            $in: book.reviews
                        }
                    }},
                    {$group: {_id: null, totalRating: {$avg: "$rating"}}}, 
                    { $project: { _id: 0, totalRating: 1 }}]);

                const totalRating = rating.map(({totalRating}) => Math.round(totalRating * 10)/10);
                const {docs: reviews, hasPrevPage, hasNextPage} = reviewDocs;
                return res.render("shop/san-pham", {book, reviews, page ,hasPrevPage, hasNextPage, totalRating});
            }
        }
        return res.status(404).render('error', { err });
    },
    postReview: async(req, res) => {
        const { id } = req.params;
        try {
            const { body, rating } = req.body;
            const book = await Book.findById(id);
            if(book){
                const review = new Review({body, rating});
                review.user = req.user._id;
                book.reviews.push(review);
                await review.save();
                await book.save();
                res.redirect(`/san-pham/${id}`)
            }
        } catch (e) {
            res.redirect(`/san-pham/${id}`)
        }
    },
    deleteReview: async (req, res) => {
        const {id, reviewId} = req.params;
        try {
            const book = await Book.findById(id);
            const review = await Review.findById(reviewId);
            if(book && review){
                await review.deleteOne();
                await book.updateOne({
                    reviews: {
                        $pull : {
                            reviews : reviewId,
                        }
                    }
                });
            }
            res.redirect(`/san-pham/${id}`)
        } catch (e) {
            res.redirect(`/san-pham/${id}`)
        }
    },
    getGenreDetails: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const query = req.query.q;
        const limit = 10;
        try {
            const genre = await Genre.findById(id);
            if(genre){
                const bookDocs = await Book.paginate({title: query},{
                    _id: {
                        $in: genre.books
                    }
                }, {page, limit});
                const {docs: books, hasPrevPage, hasNextPage} = bookDocs;
                res.render("shop/the-loai", {genre, books, hasPrevPage, hasNextPage, page});
            }
        } catch (e) {
            res.redirect("/");
        }
    },
    getAuthorDetails: async(req, res) => {
        const { id } = req.params;
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        const query = req.query.q;
        try {
            const author = await Author.findById(id);
            if(author) {
                const bookDocs = await Book.paginate({title: query}, {
                    _id: {
                        $in: author.books
                }}, {page, limit})
                const {docs: books, hasPrevPage, hasNextPage} = bookDocs;
                res.render("shop/tac-gia", {books, hasPrevPage, hasNextPage, page, author});
            }
        } catch (e) {
            res.redirect("/");
        }
    },
    addToCart: async (req, res) => {
        try {
            const { id } = req.params
            let found = false;
            let total = 0;
            let qty = 1;
            let totalItem = 0;
            const book = await Book.findById(id);
            const findCart = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]});
            if(findCart){
                for(let item of findCart.items){
                    if(item.book.equals(book._id)){
                        qty = item.qty;
                        found = true;
                        await findCart.updateOne({$pull : {items: item}});
                    }
                }
                if(found){
                    findCart.items.push({book: book._id, qty: qty + 1, price: book.price});
                }
                else{
                    findCart.items.push({book: book._id, qty: qty, price: book.price});
                }
                await findCart.save();
            }
            else{
                const cart = new Cart({
                    user: req.user._id,
                    items: {
                        book: book._id,
                        qty: 1,
                        price: book.price,
                    }
                });
                totalItem = 0;
                await cart.save();
            }
            const items = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]}, "items -_id").lean();
            if(items){
               for(let item of items.items){
                    totalItem += item.qty
                    total += (item.qty * item.price);
               }
            }
            await Cart.updateOne({$and: [{user: req.user._id}, {isPayed: false}]}, {$set: {totalPrice: total}});    
            res.send(totalItem.toString());
        } catch (error) {
            console.log(error)
        }      
    },
    addToList: async (req, res) => {
        const { id } = req.params;
        let listTotal = 0;
        let duplicate = false;
        try {
            const book = await Book.findById(id)
            const findList = await Wishlist.findOne({user: req.user._id})
            if(findList){
                for(let item of findList.list){
                    if(item.equals(book._id)){
                        duplicate = true;
                    }
                }
                if(!duplicate){
                    findList.list.push(book._id);
                    await findList.save();
                }
            }
            else {
                const newList = new Wishlist({user: req.user._id});
                newList.list.push(book._id);
                await newList.save()
            }
            const items = await Wishlist.findOne({user: req.user._id}, "list -_id").lean();
            listTotal = items.list.length;
            res.send(listTotal.toString());
        } catch (error) {
            console.log(error)
        }
    },
    renderCart: async(req, res) => {
        try {
            const limit = 20;
            const page = parseInt(req.query.page) || 0;
            const { _id: id } = req.user;
            const carts = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]})
            .populate("items.book")
            .select({"items.book" : { "$slice": [limit * page ,limit] }}); 
            res.render("shop/gio-hang", {carts, page})
        } catch (error) {
            console.log(error)
        }
    },
    updateCart: async(req, res) => {
        try {
            const {id} = req.params;
            const {qty} = req.body;
            console.log(qty);
            if(qty < 0 || qty == "") return res.redirect("/gio-hang");
            let totalPrice = 0
            const book = await Book.findById(id);
            const cart = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]})
            await cart.updateOne({$pull : {items: {book: id}}})
            if(qty > 0) {
                cart.items.push({book: id, qty: qty, price: book.price});
                await cart.save();
            }
            
            const items = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]}, "items -_id").lean();
            if(items){
               for(let item of items.items){
                    totalPrice += (item.qty * item.price);
               }
            }
            await Cart.updateOne({$and: [{user: req.user._id}, {isPayed: false}]}, {$set: {totalPrice: totalPrice}});    
            res.redirect("/gio-hang");
        } catch (error) {
            console.log(error)
        }
    },
    deleteItem: async(req, res) => {
        let totalPrice = 0;
        const  {id} = req.params;
        const cart = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]})
        await cart.updateOne({$pull : {items: {book: id}}})
        const items = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]}, "items -_id").lean();
        if(items){
           for(let item of items.items){
                totalPrice += (item.qty * item.price);
           }
        }
        await Cart.updateOne({$and: [{user: req.user._id}, {isPayed: false}]}, {$set: {totalPrice: totalPrice}});
        res.redirect("/gio-hang");
    },
    checkout: async (req, res) => {
        const {id} = req.params;
        const {email, phonenumber, address, fullname} = req.body;
        if(!email || !phonenumber || !address || !fullname) return res.redirect("/gio-hang");
        const transporter =  nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.ADMIN_EMAIL_USERNAME,
                pass: process.env.ADMIN_EMAIL_PASSWORD
            }
        });

        let output = "<h3>Bookadoodle cảm ơn bạn vì đã tin tưởng mua hàng</h3>";
        const cart = await Cart.findById(id).populate("items.book");
        for(let item of cart.items){
            price = new Number(item.price).toLocaleString('en-US', {minimumFractionDigits: 0}) + " vnđ";
            output = output.concat(`<ul><li>Sản phẩm : ${item.book.title}</li><li>Đơn giá : ${price}</li><li>Số lượng: ${item.qty}</li></ul>`);
        }
        total = new Number(cart.totalPrice).toLocaleString('en-US', {minimumFractionDigits: 0}) + " vnđ";
        output = output.concat(`<div>Tổng giá tiền: ${total}</div>`);
        output = output.concat("<h3>Đơn hàng của bạn sẽ được giao trong vòng 3-7 ngày</h3>");
        output = output.concat("<p>From Bookadoodle with love <3 </p>");
        const mainOptions = {
            from: "Bookadoodle",
            to: email,
            subject: `Khách hàng ${fullname} đã đặt hàng thành công đơn hàng #${id}`,
            text: `Bookadoodle cảm ơn bạn vì đã tin tưởng mua hàng`,
            html: output,
        }
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
                res.redirect('/');
            }
        });
        await cart.updateOne({$set: {isPayed: true}});
        const pay = new Pay({
            user: req.user._id,
            informations: {
                fullname: fullname,
                address: address,
                email: email,
                phonenumber: phonenumber,
            },
            cart: cart._id,
        });
        await pay.save();
        res.redirect("/gio-hang");
    },
    renderList: async (req, res) => {
        const items = await Wishlist.find({user: req.user._id}).lean();
        const limit = 20;
        const page = parseInt(req.query.page) || 1;
        const list = items.map(el => el.list)
        const bookDocs = await Book.paginate({_id:{$in : list[0] }}, {page, limit});
        const {docs: books, hasPrevPage, hasNextPage} = bookDocs;
        res.render("shop/danh-sach", {books, hasPrevPage, hasNextPage, page});
    },
    addListToCart: async (req, res) => {
        const { id } = req.params;
        let found = false;
        let qty = 0;
        let total = 0
        try {
            await Wishlist.updateOne({user: req.user._id}, {$pull : {list: id}});
            const findCart = await Cart.find({$and: [{user: req.user._id}, {isPayed: false}]});
            const book = await Book.findById(id);
            if(findCart.length > 0){
                for(let item of findCart[0].items){
                    if(item.book.equals(book._id)){
                        qty = item.qty;
                        found = true;
                        await findCart[0].updateOne({$pull : {items: item}});
                    }
                }
                if(found){
                    findCart[0].items.push({book: book._id, qty: qty + 1, price: book.price});
                }
                else{
                    findCart[0].items.push({book: book._id, qty: qty, price: book.price});
                }
                await findCart[0].save();
            }
            else{
                const cart = new Cart({
                    user: req.user._id,
                    items: {
                        book: book._id,
                        qty: 1,
                        price: book.price,
                    }
                });
                await cart.save();
            }
            const items = await Cart.findOne({$and: [{user: req.user._id}, {isPayed: false}]}, "items -_id").lean();
            if(items){
               for(let item of items.items){
                    total += (item.qty * item.price);
               }
            }
            await Cart.updateOne({$and: [{user: req.user._id}, {isPayed: false}]}, {$set: {totalPrice: total}});  
            res.redirect("/danh-sach-yeu-thich");
        } catch (error) {
            console.log(error);
            res.redirect("/");
        }
    },
    removeList: async (req,res) => {
        const { id } = req.params;
        await Wishlist.updateOne({user: req.user._id}, {$pull : {list: id}});
        res.redirect("/danh-sach-yeu-thich");
    }
}