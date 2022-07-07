const adminController = require("../controllers/admin.controller");
const express = require("express");
const router = express.Router();
const {isLoggedIn, validateAuthor, validateBook, isAdmin} = require("../middleware");
const CatchAsync = require("../utils/CatchAsync");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

//DASHBOARD
router.get("/", isLoggedIn,isAdmin ,adminController.renderAdmin);

//BOOKS
router.get("/books", isLoggedIn,isAdmin ,CatchAsync(adminController.renderBooks));
router.get("/books/create", isLoggedIn,isAdmin , CatchAsync(adminController.renderCreateBook));
router.get("/books/:id/edit", isLoggedIn,isAdmin , CatchAsync(adminController.renderEditBook));
router.get("/books/:id/details", isLoggedIn,isAdmin , CatchAsync(adminController.renderDetailsBook));

router.post("/books",isLoggedIn,isAdmin,validateBook,upload.array("image"),CatchAsync(adminController.postCreateBook));
router.put("/books/:id", isLoggedIn,isAdmin,validateBook,upload.array("image"),CatchAsync(adminController.putEditBook));
router.delete("/books/:id", CatchAsync(adminController.deleteBook));


//AUTHORS
router.get("/authors", isLoggedIn,isAdmin , CatchAsync(adminController.renderAuthors));
router.get("/authors/create", isLoggedIn,isAdmin , adminController.renderCreateAuthors);
router.get("/authors/:id/edit", isLoggedIn,isAdmin , CatchAsync(adminController.renderEditAuthor));
router.get("/authors/:id/details", isLoggedIn,isAdmin ,CatchAsync(adminController.renderDetailsAuthor));

router.post("/authors", isLoggedIn,isAdmin,validateAuthor,upload.array("image"),CatchAsync(adminController.postCreateAuthors));
router.put("/authors/:id", isLoggedIn,isAdmin,validateAuthor,upload.array("image"),CatchAsync(adminController.putEditAuthor));
router.delete("/authors/:id", CatchAsync(adminController.deleteAuthor));


//GENRES
router.get("/genres", isLoggedIn,isAdmin ,CatchAsync(adminController.renderGenres));
router.get("/genres/create", isLoggedIn,isAdmin , adminController.renderCreateGenre);
router.get("/genres/:id/edit", isLoggedIn,isAdmin , CatchAsync(adminController.renderEditGenre));

router.post("/genres", isLoggedIn,isAdmin, CatchAsync(adminController.postCreateGenre));
router.put("/genres/:id", isLoggedIn,isAdmin, CatchAsync(adminController.putEditGenre));


//ROLES
router.get("/roles", isLoggedIn,isAdmin, CatchAsync(adminController.renderRole));
router.get("/roles/create", isLoggedIn,isAdmin, adminController.renderCreateRole);
router.get("/roles/:id/edit", isLoggedIn,isAdmin, CatchAsync(adminController.renderEditRole));
router.get("/roles/:id/adduser", isLoggedIn,isAdmin, CatchAsync(adminController.renderAddUser));

router.post("/roles", isLoggedIn,isAdmin ,CatchAsync(adminController.postCreateRole));
router.put("/roles/:id", isLoggedIn,isAdmin, CatchAsync(adminController.putEditRole));
router.post("/roles/:roleId/:userId/add", isLoggedIn,isAdmin ,CatchAsync(adminController.postAddUser));
router.post("/roles/:roleId/:userId/remove", isLoggedIn,isAdmin ,CatchAsync(adminController.postRemoveUser));

//PAYCHECKS
router.get("/paychecks", isLoggedIn,isAdmin, CatchAsync(adminController.renderPaychecks))
router.get("/paychecks/:id/details", isLoggedIn,isAdmin, CatchAsync(adminController.renderDetailsPaycheck));


module.exports = router;
