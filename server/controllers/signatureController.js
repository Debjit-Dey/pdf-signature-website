// server/controllers/signatureController.js
const Signature = require("../models/Signature");
const Document = require("../models/Document");
const { embedSignatureOnPDF } = require("../utils/pdfLib");

// @desc    Save signature position
// @route   POST /api/signatures
exports.saveSignature = async (req, res) => {
  try {
    const { documentId, x, y, page } = req.body;

    const signature = await Signature.create({
      documentId,
      userId: req.user._id,
      x,
      y,
      page,
      status: "signed",
    });

    res.status(201).json(signature);
  } catch (err) {
    res.status(500).json({ message: "Error saving signature" });
  }
};

// @desc    Get signatures for a document
// @route   GET /api/signatures/:id
exports.getSignatures = async (req, res) => {
  try {
    const signatures = await Signature.find({
      documentId: req.params.id,
    });

    res.status(200).json(signatures);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving signatures" });
  }
};

// @desc    Finalize PDF with embedded signatures
// @route   POST /api/signatures/finalize
exports.finalizePDF = async (req, res) => {
  try {
    const { documentId } = req.body;

    const document = await Document.findById(documentId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    const signatures = await Signature.find({ documentId });

    const outputPath = await embedSignatureOnPDF(document.filepath, signatures);

    res.status(200).json({ message: "PDF finalized", signedFile: outputPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error finalizing PDF" });
  }
};
