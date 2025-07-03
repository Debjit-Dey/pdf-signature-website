// server/routes/documentRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");
const {
  uploadPDF,
  getUserDocs,
  getPDFById,
} = require("../controllers/documentController");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder relative to server root
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes
router.post("/upload", protect, upload.single("pdf"), uploadPDF);
router.get("/", protect, getUserDocs);
router.get("/:id", protect, getPDFById);

module.exports = router;
