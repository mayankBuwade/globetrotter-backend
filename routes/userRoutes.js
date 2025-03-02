const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

router.post("/save-result", async (req, res) => {
  const { username, correctAnswers, incorrectAnswers, totalScore } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username already taken. Choose another one." });
    }

    // Generate a unique userId
    const userId = uuidv4();

    const user = new User({
      userId,
      username,
      correctAnswers,
      incorrectAnswers,
      totalScore,
    });

    await user.save();

    const shareableLink = `${process.env.FRONTEND_URL}challenge/${userId}`;
    return res.json({ shareableLink });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Error saving result" });
  }
});

router.get("/user-result/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user result:", error);
    res.status(500).json({ error: "Error fetching user result" });
  }
});

module.exports = router;
