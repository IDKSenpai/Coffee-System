import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/auth/login";
import SideBar from "@/layouts/sidebar";
import ProtectedRoute from "./components/protectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SideBar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
