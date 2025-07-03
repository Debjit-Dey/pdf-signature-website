// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/docs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs(res.data);
    } catch (err) {
      alert("Failed to load documents");
    }
  };

  const handleView = (id) => {
    navigate(`/pdf/${id}`);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Your Uploaded Documents</h2>
      {docs.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc._id} className="bg-white shadow-md p-4 rounded">
              <h3 className="font-bold text-lg mb-2">{doc.filename}</h3>
              <p className="text-sm text-gray-600">
                {new Date(doc.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => handleView(doc._id)}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View & Sign
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
