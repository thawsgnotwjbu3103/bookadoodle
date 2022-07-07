const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MongoosePaginate = require("mongoose-paginate-v2");

const CartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    items: [{
        book: {type: Schema.Types.ObjectId, ref: "Book"},
        qty: {type: Number},
        price: {type: Schema.Types.Decimal128},
    }],
    totalPrice: {type: Schema.Types.Decimal128},
    isPayed: {type: Schema.Types.Boolean, default: false},
}, {timestamps: true});

CartSchema.plugin(MongoosePaginate);
module.exports = mongoose.model("Cart", CartSchema);