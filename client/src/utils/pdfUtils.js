import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const embedSignatureInPdf = async (pdfBlob, signature) => {
  const existingPdfBytes = await pdfBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const { text, x, y } = signature;

  firstPage.drawText(text, {
    x: x,
    y: firstPage.getHeight() - y,
    size: 24,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};
