const mongoose = require("mongoose");
const isObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isNumber = (value) => {
  return !isNaN(value);
};

const isYear = (value) => {
  return String(value).length === 4;
};

module.exports = { isObjectId, isNumber, isYear };
