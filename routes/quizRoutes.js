const express = require("express");
const router = express.Router();
const Destination = require("../models/Destination");

router.get("/quiz", async (req, res) => {
  try {
    let randomDestinations = await Destination.aggregate([
      { $sample: { size: 10 } }, // Fetch more than needed
    ]);

    // Ensure unique destination names
    const uniqueDestinations = [];
    const destinationNames = new Set();

    for (const d of randomDestinations) {
      if (!destinationNames.has(d.destination)) {
        destinationNames.add(d.destination);
        uniqueDestinations.push(d);
      }
      if (uniqueDestinations.length === 4) break;
    }

    if (uniqueDestinations.length < 4) {
      return res
        .status(500)
        .json({ error: "Not enough unique destinations found" });
    }

    const correctDestination = uniqueDestinations[0];

    res.json({
      id: correctDestination._id,
      clues: correctDestination.clues,
      options: uniqueDestinations.map((d) => ({
        name: d.destination,
      })),
      funFacts: correctDestination.funFacts,
    });
  } catch (error) {
    console.error("Error in /quiz route:", error);
    res.status(500).json({ error: "Error fetching quiz question" });
  }
});

// Check Answer
router.post("/check-answer", async (req, res) => {
  const { destinationId, selectedAnswer } = req.body;

  try {
    // 1️⃣ Check if `destinationId` is valid
    if (!destinationId) {
      return res.status(400).json({ error: "Missing destinationId" });
    }

    const destination = await Destination.findById(destinationId);

    // 2️⃣ Check if `destination` was found
    if (!destination) {
      console.error("❌ Destination not found for ID:", destinationId);
      return res.status(404).json({ error: "Destination not found" });
    }

    const correctAnswer = destination.destination
      .toString()
      .trim()
      .toLowerCase();
    const userAnswer = selectedAnswer?.toString().trim().toLowerCase();

    const isCorrect = correctAnswer === userAnswer;

    res.json({ correct: isCorrect });
  } catch (error) {
    console.error("🔥 Error checking answer:", error);
    res
      .status(500)
      .json({ error: "Error checking answer", details: error.message });
  }
});

module.exports = router;
