const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MongoosePaginate = require("mongoose-paginate-v2");

const PaySchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "User"},
    informations: {
        fullname: String,
        phonenumber: String,
        email: String,
        address: String,
    },
    cart: {type: Schema.Types.ObjectId, ref: "Cart"},
}, {timestamps: true});

PaySchema.plugin(MongoosePaginate);

module.exports = mongoose.model("Paycheck", PaySchema);