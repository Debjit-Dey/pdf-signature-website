// server/routes/signatureRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  saveSignature,
  getSignatures,
  finalizePDF,
} = require("../controllers/signatureController");
const Signature = require("../models/Signature");

// Save signature coordinates
router.post("/", protect, saveSignature);

// Get all signatures for a document
router.get("/:id", protect, getSignatures);

// Finalize and embed signature into PDF
router.post("/finalize", protect, finalizePDF);

// PATCH /api/signatures/:id
router.patch("/:id", protect, async (req, res) => {
  try {
    const { x, y, width, height } = req.body;

    if (x == null || y == null || width == null || height == null) {
      return res.status(400).json({ message: "Missing x/y/width/height" });
    }

    const updated = await Signature.findByIdAndUpdate(
      req.params.id,
      { x, y, width, height },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Signature not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("PATCH error:", err);
    res.status(500).json({ message: "Failed to update signature" });
  }
});

module.exports = router;
