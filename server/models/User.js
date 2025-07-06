const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: String,
  fcmToken: {
    type: String,
    default: null, // optional, used for push notifications
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
