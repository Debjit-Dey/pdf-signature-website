const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    page: { type: Number, required: true },
    text: { type: String },
    font: { type: String },
    image: { type: String }, // ✅ base64 or URL of the signature image
    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "signed",
    },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signature", signatureSchema);
