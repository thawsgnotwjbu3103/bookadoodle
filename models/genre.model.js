const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const GenreSchema = new Schema(
  {
    genre: String,
    description: String,
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "books",
      },
    ],
  },
  { timestamps: true }
);

GenreSchema.plugin(mongoosePaginate)
module.exports = mongoose.model("Genre", GenreSchema);
