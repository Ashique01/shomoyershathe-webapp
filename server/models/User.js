const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // ensures no duplicate usernames
    trim: true,
  },
  name: String, // optional, you can add more fields later
});

const User = mongoose.model("User", userSchema);
module.exports = User;