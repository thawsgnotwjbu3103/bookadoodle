const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const RoleSchema = new Schema({
    roleName: String,
    users: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
},
{timestamps: true});

RoleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Role", RoleSchema);