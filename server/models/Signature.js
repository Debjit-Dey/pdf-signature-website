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
    width: { type: Number, default: 150 },
    height: { type: Number, default: 50 },
    page: { type: Number, required: true },

    image: { type: String }, // base64 image if used
    text: { type: String }, // handwritten name
    font: { type: String }, // selected font

    status: {
      type: String,
      enum: ["pending", "signed", "rejected"],
      default: "signed",
    },
    reason: { type: String }, // optional rejection reason
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signature", signatureSchema);
