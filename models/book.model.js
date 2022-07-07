const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const ImageSchema = new Schema({
  url: String,
  fileName: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const BookSchema = new Schema(
  {
    title: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: "Genre",
    },
    description: String,
    publicationYear: String,
    price: Schema.Types.Decimal128,
    isInStock: Schema.Types.Boolean,
    images: [ImageSchema],
    reviews: [
      {
          type: Schema.Types.ObjectId,
          ref: "Review",
      }],
    },
  { timestamps: true }
);

BookSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Book", BookSchema);
