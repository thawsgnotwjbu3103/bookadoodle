const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MongoosePaginate = require("mongoose-paginate-v2");

const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

ReviewSchema.plugin(MongoosePaginate);

module.exports = mongoose.model("Review", ReviewSchema);