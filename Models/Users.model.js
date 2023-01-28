const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, reuqired: true },
});

const UserModel = mongoose.model("Users", userSchema);

module.exports = { UserModel };
