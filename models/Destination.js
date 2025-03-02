const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  destination: String,
  country: String,
  clues: [String],
  funFacts: [String],
  trivia: {
    question: String,
    options: [String],
    answer: String,
  },
});

module.exports = mongoose.model("Destination", destinationSchema);
