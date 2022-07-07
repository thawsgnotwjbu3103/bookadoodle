const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    list: [{
        type: Schema.Types.ObjectId,
        ref: "Book",
    }]
},{timestamps: true});

module.exports = mongoose.model("Wishlist", WishlistSchema);