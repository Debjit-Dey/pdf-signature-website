import React, { useState } from "react";
import "./SignaturePopup.css";

const handwritingFonts = [
  "Dancing Script",
  "Satisfy",
  "Pacifico",
  "Great Vibes",
  "Caveat",
];

const SignaturePopup = ({ onApply, onClose }) => {
  const [name, setName] = useState("");
  const [selectedFont, setSelectedFont] = useState(handwritingFonts[0]);

  const handleApply = () => {
    if (name.trim()) {
      onApply({ text: name, font: selectedFont });
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
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
