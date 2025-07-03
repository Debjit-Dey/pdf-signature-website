// server/routes/signatureRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  saveSignature,
  getSignatures,
  finalizePDF,
} = require("../controllers/signatureController");

// Save signature coordinates
router.post("/", protect, saveSignature);

// Get all signatures for a document
router.get("/:id", protect, getSignatures);

// Finalize and embed signature into PDF
router.post("/finalize", protect, finalizePDF);

module.exports = router;
