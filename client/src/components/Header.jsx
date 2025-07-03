// client/src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold text-blue-600">
        DocuSign Clone
      </Link>
      <nav className="space-x-4">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
          Dashboard
        </Link>
        <Link to="/upload" className="text-gray-700 hover:text-blue-600">
          Upload
        </Link>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
