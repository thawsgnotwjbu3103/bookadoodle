const express = require("express");
const router = express.Router();
const CatchAsync = require("../utils/CatchAsync");
const shopController = require("../controllers/shop.controller");
const {isLoggedIn, sendStatus} = require("../middleware");

router.get("/", CatchAsync(shopController.homePage));
router.get("/san-pham/:id", CatchAsync(shopController.productDetails));
router.get("/the-loai/:id", CatchAsync(shopController.getGenreDetails));
router.get("/tac-gia/:id", CatchAsync(shopController.getAuthorDetails));
router.get("/gioi-thieu", (req, res) => {res.render("shop/gioi-thieu")});
router.get("/dieu-khoan", (req, res) => {res.render("shop/dieu-khoan")});
router.get("/gio-hang", isLoggedIn, CatchAsync(shopController.renderCart));
router.get("/danh-sach-yeu-thich", isLoggedIn, CatchAsync(shopController.renderList));


router.post("/addlisttocart/:id", isLoggedIn, CatchAsync(shopController.addListToCart));
router.post("/removelist/:id", isLoggedIn, CatchAsync(shopController.removeList));
router.post("/deletecart/:id", isLoggedIn, CatchAsync(shopController.deleteItem));
router.post("/checkout/:id", isLoggedIn, CatchAsync(shopController.checkout));
router.post("/san-pham/:id", isLoggedIn, CatchAsync(shopController.postReview));
router.post("/cart/:id", sendStatus ,CatchAsync(shopController.addToCart));
router.post("/wishlist/:id", sendStatus ,CatchAsync(shopController.addToList));
router.put("/updatecart/:id", isLoggedIn, CatchAsync(shopController.updateCart));
router.delete("/san-pham/:id/:reviewId", isLoggedIn, CatchAsync(shopController.deleteReview));
module.exports = router;