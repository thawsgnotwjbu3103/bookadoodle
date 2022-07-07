if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const mongoose = require("mongoose");
const Author = require("../models/author.model");
const Book = require("../models/book.model");
const Genre = require("../models/genre.model");
const { books, authors, genres } = require("./data");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", (err) => {
  console.log(err);
});
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Book.deleteMany({});
  await Author.deleteMany({});
  await Genre.deleteMany({});
  for (let author of authors) {
    const newAuthor = new Author(author);
    await newAuthor.save();
  }

  for (let genre of genres) {
    const newGenre = new Genre(genre);
    await newGenre.save();
  }

  for (let book of books) {
    const newBook = new Book(book);
    const author = await Author.findOne({});
    const genre = await Genre.findOne({});
    author.books.push(newBook);
    genre.books.push(newBook);
    await newBook.save();
    await author.save();
    await genre.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
