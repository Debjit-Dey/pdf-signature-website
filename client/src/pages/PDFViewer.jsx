import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SignaturePopup from "../components/SignaturePopup";
import DraggableResizableSignature from "../components/DraggableResizableSignature";

const API = import.meta.env.VITE_API_BASE_URL;

const PDFViewer = () => {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [appliedSign, setAppliedSign] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfDimensions, setPdfDimensions] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const handleResize = () => {
      const pdfEl = document.querySelector(".rpv-core__viewer"); // class inside @react-pdf-viewer
      if (pdfEl) {
        setPdfDimensions({
          width: pdfEl.offsetWidth,
          height: pdfEl.offsetHeight,
        });
      }
    };

    // Run once and on window resize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchPdf = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/docs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to load PDF", err);
    }
  };

  const fetchSignatures = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/signatures/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSignatures(res.data);
    } catch (err) {
      console.error("Failed to fetch signatures", err);
    }
  };

  const handleDrop = async ({
    image,
    x,
    y,
    page,
    width = 120,
    height = 40,
  }) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/api/signatures`,
        { documentId: id, x, y, page, width, height, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSignatures((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const handleUpdate = async (sigId, newX, newY, width, height) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/api/signatures/${sigId}`,
        { x: newX, y: newY, width, height },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSignatures((prev) =>
        prev.map((s) =>
          s._id === sigId ? { ...s, x: newX, y: newY, width, height } : s
        )
      );
    } catch (err) {
      console.error("Error updating signature:", err);
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/api/signatures/finalize`,
        { documentId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fileRes = await axios.get(`${API}${res.data.signedFile}`, {
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
    fetchSignatures();
  }, [id]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6">
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

        <div
          className="relative border shadow rounded bg-white h-[85vh] overflow-auto"
          id="pdf-container"
        >
          {pdfUrl && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          )}

          {signatures.map((sig) => (
            <DraggableResizableSignature
              key={sig._id}
              sig={sig}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {showPopup && (
          <SignaturePopup
            onApply={(sign) => {
              setAppliedSign(sign);
              handleDrop({
                ...sign,
                x: 100,
                y: 100,
                page: 1,
                width: 150,
                height: 50,
              });
              setShowPopup(false);
            }}
            onClose={() => setShowPopup(false)}
            onDrop={handleDrop}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default PDFViewer;
