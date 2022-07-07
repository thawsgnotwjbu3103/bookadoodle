const Book = require("../models/book.model");
const Author = require("../models/author.model");
const Genre = require("../models/genre.model");
const Role = require("../models/role.model");
const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const Pay = require("../models/paycheck.model");
const { isObjectId, isNumber, isYear } = require("../utils/MongooseValidation");
const { cloudinary } = require("../cloudinary/index");
const { query } = require("express");
require("dotenv").config();

module.exports = {
  //GET : /admin
  renderAdmin: (req, res) => {
    res.render("admin/dashboard");
  },

  //GET : /admin/books
  renderBooks: async (req, res) => {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const query = req.query.q || undefined;
    const paginatedDocs = await Book.paginate(
      {title: query},
      { populate: "author genre", page, limit }
    );
    const { docs: books, hasPrevPage, hasNextPage } = paginatedDocs;
    res.render("admin/books/index", { books, hasPrevPage, hasNextPage, page });
  },

  //GET : /admin/books/create
  renderCreateBook: async (req, res) => {
    const authors = await Author.find({});
    const genres = await Genre.find({});
    res.render("admin/books/create", { authors, genres });
  },

  //POST: /admin/books
  postCreateBook: async (req, res) => {
    const { author: authorId, genre: genreId, status, ...rest } = req.body;
    const images = req.files.map((f) => ({
      url: f.path,
      fileName: f.filename,
    }));

    if (isObjectId(authorId) && isObjectId(genreId) && isNumber(status)) {
      const findAuthor = await Author.findById(authorId);
      const findGenre = await Genre.findById(genreId);
      if(findAuthor && findGenre){
        const newBook = new Book(rest);
        newBook.author = authorId;
        newBook.genre = genreId;
        newBook.isInStock = !!parseInt(status, 10);
        newBook.images = images;
        await newBook.save();
  
        findAuthor.books.push(newBook);
        findGenre.books.push(newBook);
  
        await findAuthor.save();
        await findGenre.save();
        req.flash("success", "Thêm sách mới thành công");
        return res.redirect("/admin/books");
      }
    }
    if (images) {
      for (let image of images) {
        cloudinary.uploader.destroy(image.fileName);
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("admin/books/create");
  },

  //GET : /admin/books/:id/details
  renderDetailsBook: async (req, res) => {
    const { id } = req.params;
    if (isObjectId(id)) {
      const book = await Book.findById(id).populate("author genre");
      if (book) {
        return res.render("admin/books/details", { book });
      }
    }
    return res.redirect("/admin/books");
  },

  //GET /admin/books/:id/edit
  renderEditBook: async (req, res) => {
    const { id } = req.params;
    const authors = await Author.find({});
    const genres = await Genre.find({});
    if (isObjectId(id)) {
      const book = await Book.findById(id).populate("author genre");
      if (book) {
        return res.render("admin/books/edit", { book, authors, genres });
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("/admin/books");
  },

  //PUT /admin/books/:id/edit
  putEditBook: async (req, res) => {
    const { id } = req.params;
    const {
      author: authorId,
      genre: genreId,
      deleteImages,
      status,
      ...rest
    } = req.body;

    const images = req.files.map((f) => ({
      url: f.path,
      fileName: f.filename,
    }));

    if (isObjectId(authorId) && isObjectId(id) &&isObjectId(genreId) && isNumber(status)) {
      const updatedBook = await Book.findById(id);
      const findAuthor = await Author.findById(authorId);
      const findGenre = await Genre.findById(genreId);
      if (updatedBook && findAuthor && findGenre) {
        if(updatedBook.author !== authorId){
          await Author.updateOne({books: id}, {
            $pull: {books: id}
          });
          findAuthor.books.push(updatedBook);
          await findAuthor.save();
        }

        if(updatedBook.genre !== genreId){
          await Genre.updateOne({books: id}, {
            $pull: {books: id}
          });
          findGenre.books.push(updatedBook);
          await findGenre.save();
        }

        await updatedBook.updateOne({
          author: authorId,
          genre: genreId,
          isInStock: !!parseInt(status, 10),
          rest
        });

        updatedBook.images.push(...images);
        await updatedBook.save();

        if (deleteImages) {
          for (let filename of deleteImages) {
            await cloudinary.uploader.destroy(filename);
          }
          await updatedBook.updateOne({
            $pull: { images: { fileName: { $in: deleteImages } } },
          });
        }
        req.flash("success", "Sửa thông tin sách thành công");
        return res.redirect("/admin/books");
      }
    }

    if (images) {
      for (let image of images) {
        await cloudinary.uploader.destroy(image.fileName);
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect(`/admin/books/${id}/edit`);
  },

  //DELETE /admin/books/:id
  deleteBook: async (req, res) => {
    const { id } = req.params;
    if (isObjectId(id)) {
      const deletedBook = await Book.findById(id);
      if (deletedBook) {
        for (let image of deletedBook.images) {
          await cloudinary.uploader.destroy(image.fileName);
        }
      }
      await deletedBook.deleteOne();
      await Author.updateOne(
        { books: id },
        {
          $pull: { books: id },
        }
      );
      await Genre.updateOne(
        { books: id },
        {
          $pull: { books: id },
        }
      );
      req.flash("success", "Xoá thành công");
    }
    res.redirect("/admin/books");
  },

  //GET /admin/authors
  renderAuthors: async (req, res) => {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const query = req.query.q || undefined;
    const paginatedDocs = await Author.paginate({fullname: query}, { page, limit });
    const { docs: authors, hasPrevPage, hasNextPage } = paginatedDocs;
    res.render("admin/authors/index", { authors, hasPrevPage, hasNextPage, page });
  },

  //GET /admin/authors/create
  renderCreateAuthors: (req, res) => {
    res.render("admin/authors/create");
  },

  //POST /admin/authors
  postCreateAuthors: async (req, res) => {
    const images = req.files.map((f) => ({
      url: f.path,
      fileName: f.filename,
    }));
    const { age, ...rest } = req.body;
    if (isYear(age)) {
      const author = new Author(rest);
      author.images = images;
      author.age = age;
      await author.save();
      req.flash("success", "Thêm tác giả thành công");
      return res.redirect("/admin/authors");
    }
    if (images) {
      for (let image of images) {
        await cloudinary.uploader.destroy(image.fileName);
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("/admin/authors/create");
  },

  //GET /admin/authors/:id/edit
  renderEditAuthor: async (req, res) => {
    const { id } = req.params;
    if (isObjectId(id)) {
      const author = await Author.findById(id);
      if (author) {
        return res.render("admin/authors/edit", { author });
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("/admin/authors");
  },

  //PUT /admin/authors/:id/edit
  putEditAuthor: async (req, res) => {
    const { id } = req.params;
    const images = req.files.map((f) => ({
      url: f.path,
      fileName: f.filename,
    }));
    if (isObjectId(id)) {
      const author = await Author.findById(id);
      if (author) {
        const { deleteImages, ...rest } = req.body;
        await author.updateOne(rest);
        author.images.push(...images);
        await author.save();

        if (deleteImages) {
          for (let filename of deleteImages) {
            await cloudinary.uploader.destroy(filename);
          }
          await author.updateOne({
            $pull: { images: { fileName: { $in: deleteImages } } },
          });
        }
        req.flash("success", "Chỉnh sửa thông tin tác giả thành công");
        return res.redirect("/admin/authors");
      }
    }

    if (images) {
      for (let image of images) {
        await cloudinary.uploader.destroy(image.fileName);
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect(`/admin/authors/${id}/edit`);
  },

  //DELETE /admin/authors/:id/delete
  deleteAuthor: async (req, res) => {
    const { id } = req.params;
    if (isObjectId(id)) {
      const deletedAuthor = await Author.findById(id).populate("books");
      if(deletedAuthor && deletedAuthor.books){
        for(let book of deletedAuthor.books){
          for(let image of book.images){
            await cloudinary.uploader.destroy(image.fileName);
          }
          await Genre.updateOne({books: book._id}, {
            $pull: {books: book._id}
          });
        }

        if(deletedAuthor.images){
          for(let image of deletedAuthor.images){
            await cloudinary.uploader.destroy(image.fileName)
          }
        }

        await Book.deleteMany({
          _id: {
            $in: deletedAuthor.books
          }
        });
        
        await deletedAuthor.deleteOne();
      }
    }
    req.flash("success", "Xoá thông tin tác giả thành công");
    res.redirect("/admin/authors");
  },

  //GET /admin/authors/:id/details
  renderDetailsAuthor: async (req, res) => {
    const { id } = req.params;
    if (isObjectId(id)) {
      const author = await Author.findById(id).populate({
        path: "books",
        populate: {
          path: "genre",
        },
      });
      if (author) {
        return res.render("admin/authors/details", { author });
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("/admin/authors");
  },

  //GET /admin/genres
  renderGenres: async (req, res) => {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const query = req.query.q || undefined;
    const paginatedDocs = await Genre.paginate({genre: query}, { page, limit });
    const { docs: genres, hasPrevPage, hasNextPage } = paginatedDocs;
    res.render("admin/genres/index", { genres, hasPrevPage, hasNextPage, page });
  },

  //GET /admin/genres/create
  renderCreateGenre: (req, res) => {
    res.render("admin/genres/create");
  },

  //POST /admin/genres/create
  postCreateGenre: async (req, res) => {
    const newGenre = new Genre(req.body);
    await newGenre.save();
    req.flash("success", "Thêm thể loại thành công");
    res.redirect("/admin/genres");
  },

  //GET /admin/genres/:id/edit
  renderEditGenre: async(req, res) => {
    const { id } = req.params;
    if(isObjectId(id)){
      const genre = await Genre.findById(id);
      if(genre){
        return res.render("admin/genres/edit", {genre});
      }
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("/admin/genres");
  },

  //PUT /admin/genres/:id
  putEditGenre: async(req, res) => {
    const {id} = req.params;
    if(isObjectId(id)){
      const findGenre = await Genre.findById(id);
      if(findGenre){
        await findGenre.updateOne(req.body);
      }
    }
    req.flash("success", "Chinh sửa thể loại thành công");
    return res.redirect("/admin/genres");
  },

  //GET /admin/roles
  renderRole: async (req, res) => {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const query = req.query.q || undefined;
    const paginatedDocs = await Role.paginate({roleName: query}, {page, limit});
    const {docs: roles, hasPrevPage, hasNextPage} = paginatedDocs;
    res.render("admin/roles/index", {roles, hasPrevPage, hasNextPage, page});
  },
  
  //GET /admin/roles/create
  renderCreateRole: (req, res) => {
    res.render("admin/roles/create");
  },

  //POST /admin/roles
  postCreateRole: async (req, res) => {
    const { roleName } = req.body
    const newRole = new Role({roleName});
    try {
      await newRole.save();
      req.flash("success", "Thêm quyền truy cập thành công");
      res.redirect("/admin/roles");
    } catch (error) {
      req.flash("error", "Có lỗi xảy ra");
      res.redirect("/admin/roles");
    }
  },

  //GET /admin/roles/:id/edit
  renderEditRole: async (req, res)=>{
    const {id} = req.params;
    if(isObjectId(id)){
      const findRole = await Role.findById(id);
      if(findRole){
        return res.render("admin/roles/edit", {findRole});
      } 
    }
    req.flash("error", "Có lỗi xảy ra");
    return res.redirect("/admin/roles");
  },

  //PUT /admin/roles/:id
  putEditRole: async (req, res) => {
    const { id } = req.params;
    if(isObjectId(id)){
      const findRole = await Role.findById(id).lean();
      if(findRole){
        const { roleName } = req.body;
        try {
          const update = await Role.findByIdAndUpdate(id, {roleName: roleName});
          req.flash("success","Cập nhật thành công");
        } catch (error) {
          req.flash("error","Có lỗi xảy ra");
        }
      }
    }
    res.redirect("/admin/roles");
  },

  //GET /admin/roles/:id/adduser
  renderAddUser: async (req, res) => {
    const { id } = req.params;
    const limit = 20;
    const uIR = parseInt(req.query.uIR) || 1;
    const uNIR = parseInt(req.query.uNIR) || 1;
    const unameIR = req.query.unameir || undefined;
    const unameNIR = req.query.unamenir || undefined;
    if(isObjectId(id)){
      const findRole = await Role.findById(id);
      if(findRole){
        const userInRole = await User.paginate({username: unameIR ,_id: {$in: findRole.users}}, {page: uIR, limit});
        const userNotInRole = await User.paginate({username: unameNIR,_id: {$nin: findRole.users}},{page: uNIR, limit});
        res.render("admin/roles/adduser", {userInRole, userNotInRole, id});
      }
    }
  },

  //POST /admin/roles/:roleId/:userId/add
  postAddUser: async (req, res) => {
    const { roleId, userId } = req.params;
    if(isObjectId(roleId) && isObjectId(userId)){
      const role = await Role.findById(roleId);
      const user = await User.findById(userId);
      if(role){
        role.users.push(user);
        try {
          await role.save();
          req.flash("success", "Thêm thành công");
        } catch (error) {
          req.flash("error", "Có lỗi xảy ra");
        }
      }
    }
    res.redirect(`/admin/roles/${roleId}/adduser`);
  },

  //POST /admin/roles/:roleId/:userId/remove
  postRemoveUser: async(req, res) => {
    const {roleId, userId} = req.params;
    if(isObjectId(roleId) && isObjectId(userId)){
      const user = await User.findById(userId);
      const role = await Role.findById(roleId);
      if(role&&user){
        try {
          await role.updateOne({$pull: {users: user._id,}})
          req.flash("success", "Xoá quyền thành công");
        } catch (error) {
          req.flash("error", "Có lỗi xảy ra");
        }
      }
    }
    res.redirect(`/admin/roles/${roleId}/adduser`);
  },

  renderPaychecks: async(req, res) => {
    const limit = 20;
    const page = parseInt(req.query.page) || 1;
    const payDocs = await Pay.paginate({isPayed: false}, {populate: "user cart" ,page, limit});
    const {docs: pays, hasPrevPage, hasNextPage} = payDocs;
    res.render("admin/pays/index", {pays, hasNextPage, hasPrevPage, page});
  },

  renderDetailsPaycheck: async (req, res) => {
    const { id } = req.params;
    let queryArr = [];
    const pay = await Pay.findById(id).populate({
      path: "cart",
      populate: {
        path: "items.book"
      }
    }).populate("user");
    res.render("admin/pays/details", {pay});
  }
};

