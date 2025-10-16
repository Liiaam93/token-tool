import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // Import Routes and Route components
import Home from "./pages/Home";
import BranchCodes from "./pages/BranchCodes";
import Templates from "./pages/Templates";
import Portal from "./pages/Portal";
import Reports from "./pages/Reports";
import { AnimatePresence } from "framer-motion";
import PageWrapper from "./components/PageWrapper";
import NotFound from "./pages/NotFound";
import BarcodeCorrector from "./pages/BarcodeCorrector";
import AccountChecker from "./pages/AccountChecker";


const App: React.FC = () => {
  const location = useLocation()

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      <AnimatePresence mode="popLayout" initial={false} >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/branch-codes" element={<PageWrapper><BranchCodes /></PageWrapper>} />
          <Route path="/templates" element={<PageWrapper><Templates /> </PageWrapper>} />
          <Route path="/portal" element={<PageWrapper><Portal /></PageWrapper>} />
          <Route path="/reports" element={<PageWrapper><Reports /></PageWrapper>} />
          <Route path="/barcode-corrector" element={<PageWrapper><BarcodeCorrector /></PageWrapper>} />
          <Route path="/account-checker" element={<PageWrapper><AccountChecker /></PageWrapper>} />

          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />


        </Routes>
      </AnimatePresence >
    </div>
  );
};

export default App;
