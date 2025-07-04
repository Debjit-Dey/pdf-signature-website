// server/controllers/signatureController.js
const Signature = require("../models/Signature");
const Document = require("../models/Document");
const { embedSignatureOnPDF } = require("../utils/pdfLib");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

// @desc    Save signature position
// @route   POST /api/signatures
// exports.saveSignature = async (req, res) => {
//   try {
//     const { documentId, x, y, page } = req.body;

//     const signature = await Signature.create({
//       documentId,
//       userId: req.user._id,
//       x,
//       y,
//       page,
//       status: "signed",
//     });

//     res.status(201).json(signature);
//   } catch (err) {
//     res.status(500).json({ message: "Error saving signature" });
//   }
// };
// server/controllers/signatureController.js
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
// @desc Finalize PDF with embedded signatures
exports.finalizePDF = async (req, res) => {
  try {
    const { documentId, screenWidth, screenHeight } = req.body;

    const document = await Document.findById(documentId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    const signatures = await Signature.find({ documentId });

    const existingPdfBytes = fs.readFileSync(document.filepath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const pdfWidth = page.getWidth();
    const pdfHeight = page.getHeight();

    const scaleX = pdfWidth / screenWidth;
    const scaleY = pdfHeight / screenHeight;

    const scaledSignatures = signatures.map((sig) => ({
      ...sig.toObject(),
      x: sig.x * scaleX,
      y: sig.y * scaleY,
      width: sig.width * scaleX,
      height: sig.height * scaleY,
    }));

    const outputPath = await embedSignatureOnPDF(
      document.filepath,
      scaledSignatures
    );

    res
      .status(200)
      .json({ message: "PDF finalized", signedFile: `/${outputPath}` });
  } catch (err) {
    console.error("❌ Finalize PDF error:", err);
    res.status(500).json({ message: "Error finalizing PDF" });
  }
};
