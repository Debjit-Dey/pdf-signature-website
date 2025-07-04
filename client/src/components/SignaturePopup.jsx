import React, { useState, useRef } from "react";
import "./SignaturePopup.css";

const handwritingFonts = [
  "Dancing Script",
  "Satisfy",
  "Pacifico",
  "Great Vibes",
  "Caveat",
];

const SignaturePopup = ({ onApply, onClose, onDrop }) => {
  const [name, setName] = useState("");
  const [selectedFont, setSelectedFont] = useState(handwritingFonts[0]);
  const canvasRef = useRef(null);

  const handleApply = async () => {
    if (!name.trim()) return;

    // Draw signature on canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 300;
    canvas.height = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.font = `32px "${selectedFont}"`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(name, 10, canvas.height / 2);

    // Convert canvas to base64 image
    const dataUrl = canvas.toDataURL("image/png");

    // Send the base64 image instead of text/font
    onDrop({
      image: dataUrl,
      x: 100,
      y: 100,
      page: 1,
      width: 150,
      height: 50,
    });

    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup bg-white p-4 rounded shadow">
        <h3 className="text-xl font-bold mb-2">Enter Your Signature</h3>
        <input
          type="text"
          placeholder="Enter your name"
          className="border p-2 w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="mb-2">Choose Handwriting Style:</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {handwritingFonts.map((font) => (
            <button
              key={font}
              onClick={() => setSelectedFont(font)}
              className={`p-2 border rounded ${
                selectedFont === font ? "bg-blue-500 text-white" : ""
              }`}
              style={{ fontFamily: font }}
            >
              {name || "Signature"}
            </button>
          ))}
        </div>

        {/* Hidden canvas to generate image */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border">
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePopup;
