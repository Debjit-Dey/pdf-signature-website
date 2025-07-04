const fontkit = require("fontkit");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb } = require("pdf-lib");

// Font map: maps font label to file name
const fontMap = {
  "Dancing Script": "DancingScript-Regular.ttf",
  Pacifico: "Pacifico-Regular.ttf",
  Satisfy: "Satisfy-Regular.ttf",
  Caveat: "Caveat-Regular.ttf",
  "Great Vibes": "GreatVibes-Regular.ttf",
};

exports.embedSignatureOnPDF = async (filePath, signatures) => {
  try {
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const pages = pdfDoc.getPages();

    for (const sig of signatures) {
      const page = pages[sig.page - 1] || pages[0];

      if (sig.image) {
        // 🖼️ IMAGE signature logic
        let embeddedImg;

        const base64Data = sig.image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        if (sig.image.startsWith("data:image/png")) {
          embeddedImg = await pdfDoc.embedPng(imageBuffer);
        } else if (
          sig.image.startsWith("data:image/jpeg") ||
          sig.image.startsWith("data:image/jpg")
        ) {
          embeddedImg = await pdfDoc.embedJpg(imageBuffer);
        } else {
          console.warn("⚠️ Unsupported image format for signature.");
          continue;
        }

        const pngDims = embeddedImg.scale(1);
        const drawWidth = sig.width || pngDims.width;
        const drawHeight = sig.height || pngDims.height;

        page.drawImage(embeddedImg, {
          x: sig.x,
          y: page.getHeight() - sig.y - drawHeight,
          width: drawWidth,
          height: drawHeight,
        });
      } else if (sig.text && sig.font) {
        // 🖋️ TEXT signature logic
        const fontKey = sig.font.trim();
        const fontFile = fontMap[fontKey] || fontMap["Dancing Script"];
        const fontPath = path.join(__dirname, "../assets/fonts", fontFile);

        if (!fs.existsSync(fontPath)) {
          console.warn(`⚠️ Font file not found: ${fontPath}`);
          continue;
        }

        const fontBytes = fs.readFileSync(fontPath);
        const customFont = await pdfDoc.embedFont(new Uint8Array(fontBytes));

        page.drawText(sig.text, {
          x: sig.x,
          y: page.getHeight() - sig.y,
          font: customFont,
          size: 18,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const signedFilePath = path.join("uploads", `signed-${Date.now()}.pdf`);
    fs.writeFileSync(signedFilePath, pdfBytes);

    return signedFilePath;
  } catch (err) {
    console.error("❌ PDF signing error (outer):", err);
    throw new Error("PDF processing failed");
  }
};
