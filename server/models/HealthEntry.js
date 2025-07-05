const mongoose = require("mongoose");

const healthEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  bp: { type: String, required: true },
  sugar: { type: String, required: true },
  weight: { type: String, required: true },
});

const HealthEntry = mongoose.model("HealthEntry", healthEntrySchema);
module.exports = HealthEntry;
