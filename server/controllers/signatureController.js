const Signature = require("../models/Signature");
const Document = require("../models/Document");
const { embedSignatureOnPDF } = require("../utils/pdfLib");

// @desc    Save signature (text/image) position and properties
// @route   POST /api/signatures
// @access  Protected
exports.saveSignature = async (req, res) => {
  try {
    const {
      documentId,
      x,
      y,
      page,
      text,
      font,
      image, // ✅ base64-encoded image (optional)
      width,
      height,
    } = req.body;

    // Either text or image must be provided
    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Either text or image signature is required." });
    }

    const signature = await Signature.create({
      documentId,
      userId: req.user._id,
      x,
      y,
      page,
      text,
      font,
      image, // ✅ saved if provided
      width,
      height,
      status: "signed",
    });

    res.status(201).json(signature);
  } catch (err) {
    console.error("❌ Save Signature Error:", err);
    res.status(500).json({ message: "Error saving signature" });
  }
};

// @desc    Get all signatures for a document
// @route   GET /api/signatures/:id
// @access  Protected
exports.getSignatures = async (req, res) => {
  try {
    const signatures = await Signature.find({
      documentId: req.params.id,
    });

    res.status(200).json(signatures);
  } catch (err) {
    console.error("❌ Error fetching signatures:", err);
    res.status(500).json({ message: "Error retrieving signatures" });
  }
};

// @desc    Finalize PDF with all embedded signatures (image/text)
// @route   POST /api/signatures/finalize
// @access  Protected
exports.finalizePDF = async (req, res) => {
  try {
    const { documentId } = req.body;

    const document = await Document.findById(documentId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    const signatures = await Signature.find({ documentId });

    const signedFilePath = await embedSignatureOnPDF(
      document.filepath,
      signatures
    );

    res.status(200).json({
      message: "PDF finalized",
      signedFile: `/${signedFilePath}`,
    });
  } catch (err) {
    console.error("❌ Finalize PDF error:", err);
    res.status(500).json({ message: "Error finalizing PDF" });
  }
};
