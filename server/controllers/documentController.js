// server/controllers/documentController.js
const Document = require("../models/Document");
const path = require("path");
const fs = require("fs");

// @desc    Upload PDF
// @route   POST /api/docs/upload
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newDoc = await Document.create({
      filename: req.file.originalname,
      filepath: req.file.path,
      uploadedBy: req.user._id,
    });

    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ message: "Error uploading PDF" });
  }
};

// @desc    Get all PDFs for logged-in user
// @route   GET /api/docs
exports.getUserDocs = async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });
    if (!docs) return res.status(404).json({ message: "Documents not found" });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents" });
  }
};

// @desc    View PDF file
// @route   GET /api/docs/:id
exports.getPDFById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) return res.status(404).json({ message: "Document not found" });

    const filePath = path.resolve(doc.filepath);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found" });

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: "Error fetching file" });
  }
};
