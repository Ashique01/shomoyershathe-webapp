const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicineName: { type: String, required: true },
  time: { type: String, required: true },
});

const Reminder = mongoose.model("Reminder", reminderSchema);
module.exports = Reminder;