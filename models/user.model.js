const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new Schema(
  {
		username: {
			type: String,
			unique: true,
		},
		password: String,
		email: {
			type: String,
			unique: true
		},
  }, 
	{timestamps: true}
);

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", UserSchema);