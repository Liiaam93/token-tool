import React from "react";
import { Routes, Route } from "react-router-dom"; // Import Routes and Route components
import Home from "./pages/Home";
import BranchCodes from "./pages/BranchCodes";
import Templates from "./pages/Templates";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/branch-codes" element={<BranchCodes />} />
      <Route path="/templates" element={<Templates />} />
    </Routes>
  );
};

export default App;
