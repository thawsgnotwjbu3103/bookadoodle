const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Book = require("./book.model");
const mongoosePaginate = require("mongoose-paginate-v2");

const ImageSchema = new Schema({
  url: String,
  fileName: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const AuthorSchema = new Schema(
  {
    fullname: String,
    age: Number,
    hometown: String,
    description: String,
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    images: [ImageSchema],
  },
  { timestamps: true }
);

AuthorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Author", AuthorSchema);
