// server/utils/pdfLib.js
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

// @desc    Embed signature text into PDF at specified coordinates
exports.embedSignatureOnPDF = async (filePath, signatures) => {
  try {
    // Read existing PDF
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed font
    const font = await pdfDoc.embedFont(PDFDocument.PDFFont.Helvetica);

    // Add each signature to the correct page
    for (const sig of signatures) {
      const pages = pdfDoc.getPages();
      const page = pages[sig.page - 1]; // Page number is 1-based

      page.drawText("Signed by user", {
        x: sig.x,
        y: sig.y,
        size: 12,
        font: font,
        color: rgb(0, 0.53, 0.71),
      });
    }

    // Save to new signed file
    const signedPdfBytes = await pdfDoc.save();
    const signedFilePath = path.join("uploads", `signed-${Date.now()}.pdf`);
    fs.writeFileSync(signedFilePath, signedPdfBytes);

    return signedFilePath;
  } catch (err) {
    console.error("Error embedding signature:", err);
    throw new Error("PDF processing failed");
  }
};
