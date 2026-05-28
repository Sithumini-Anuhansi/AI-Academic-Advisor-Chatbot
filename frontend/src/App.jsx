import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PredictionForm from "./pages/PredictionForm";
import Chatbot from "./pages/Chatbot";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar */}
      <Navbar />

      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 pt-16">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<PredictionForm />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;