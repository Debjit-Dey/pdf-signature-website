import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SignaturePopup from "../components/SignaturePopup";
import DraggableSignature from "../components/DraggableSignature";

const API = import.meta.env.VITE_API_BASE_URL;

const DropZone = ({ pdfUrl, signatures, onDrop, appliedSign }) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: "SIGNATURE",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const dropTarget = document.getElementById("pdf-container");
      const rect = dropTarget.getBoundingClientRect();
      const x = offset.x - rect.left;
      const y = offset.y - rect.top;

      onDrop({
        text: item.text,
        font: item.font,
        x,
        y,
        page: 1, // future enhancement: map to page
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      id="pdf-container"
      ref={dropRef}
      className="relative border shadow rounded bg-white h-[85vh] overflow-auto"
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPlugin()]} />
      </Worker>

      {signatures.map((sig, idx) => (
        <div
          key={idx}
          className="absolute pointer-events-none"
          style={{
            top: sig.y,
            left: sig.x,
            fontFamily: sig.font,
            fontSize: 20,
            color: "#000",
            zIndex: 20,
          }}
        >
          {sig.text}
        </div>
      ))}
    </div>
  );
};

const PDFViewer = () => {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [appliedSign, setAppliedSign] = useState(null);
  const [error, setError] = useState(null);

  const fetchPdf = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/docs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error fetching PDF:", err);
      setError("Could not load the PDF file.");
    }
  };

  const handleDrop = async ({ text, font, x, y, page }) => {
    setSignatures((prev) => [...prev, { text, font, x, y, page }]);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/signatures`,
        { documentId: id, x, y, page },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error saving signature:", err);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/api/signatures/finalize`,
        { documentId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fileRes = await axios.get(res.data.signedFile, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(fileRes.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      a.click();
    } catch (err) {
      console.error("Error downloading signed PDF:", err);
    }
  };

  useEffect(() => {
    fetchPdf();
  }, [id]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">PDF Viewer</h1>
          <div className="space-x-2">
            <button
              onClick={() => setShowPopup(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign PDF
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Download Signed
            </button>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {pdfUrl && (
          <DropZone
            pdfUrl={pdfUrl}
            signatures={signatures}
            onDrop={handleDrop}
            appliedSign={appliedSign}
          />
        )}

        {showPopup && (
          <SignaturePopup
            onApply={(sign) => {
              setAppliedSign(sign);
              setShowPopup(false);
            }}
            onClose={() => setShowPopup(false)}
          />
        )}

        {appliedSign && (
          <div className="mt-4">
            <p className="mb-2 font-semibold">Drag this into PDF:</p>
            <DraggableSignature {...appliedSign} />
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default PDFViewer;
